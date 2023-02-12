import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../pages/_app";
import { useStore } from "../store";

export const useRecommendedQuizzes = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { userRefs, studyMode } = useStore();

  // Fetch quizzes recommended by the Learning Engine
  const fetchQuizzes = async () => {
    try {
      if (!userRefs) {
        console.warn("No userRefs found");
        return;
      }

      if (!userRefs.firebaseId) {
        console.warn("No firebaseId found");
        return;
      }

      if (!userRefs.memreId) {
        console.warn("No memreId found");
        return;
      }

      // Get memreIds of items to study from the Learning Engine
      const response = await fetch(
        `/api/study?firebaseId=${userRefs.firebaseId}&memreUserId=${userRefs.memreId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recommended quizzes");
      }

      const data = await response.json();
      const memreIds = data.data.data.map((item: any) => item.id);

      if (memreIds.length === 0) {
        console.log("No quizzes to study");
        setQuizzes([]);
        return;
      }

      // Get quizzes from Firestore with memreIds from Learning Engine
      let qs: any[] = [];
      const quizzesQuery = query(
        collection(db, "users", userRefs.firebaseId, "quizzes"),
        where("memreId", "in", memreIds)
      );
      const quizzesSnapshot = await getDocs(quizzesQuery);
      if (quizzesSnapshot.empty) {
        console.log("No quizzes found.");
      }
      quizzesSnapshot.forEach((snap: any) => {
        qs.push({ id: snap.id, ...snap.data() });
      });
      setQuizzes(qs);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [JSON.stringify(userRefs), studyMode]);

  return { quizzes, loading, error };
};
