import { db } from "@/pages/_app";
import { useStore } from "@/store";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export const useSourceQuizzes = (sourceId: string) => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { userRefs } = useStore();

  // Fetch quizzes by source
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

      // Get quizzes from Firestore
      let qs: any[] = [];
      const quizzesQuery = query(
        collection(db, "users", userRefs.firebaseId, "quizzes"),
        where("sourceId", "==", sourceId)
      );
      const quizzesSnapshot = await getDocs(quizzesQuery);
      if (quizzesSnapshot.empty) {
        console.warn("No quizzes found.");
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
  }, [JSON.stringify(userRefs)]);

  return { quizzes, loading, error };
};
