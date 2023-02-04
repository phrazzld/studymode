import { collection, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../pages/_app";
import { useStore } from "../store";

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { userRefs } = useStore();

  // Fetch quizzes from Firestore
  const fetchQuizzes = async () => {
    try {
      if (!userRefs) {
        return;
      }

      if (!userRefs.firebaseId) {
        return;
      }

      let qs: any[] = [];
      const quizzesQuery = query(
        collection(db, "users", userRefs.firebaseId, "quizzes")
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
  }, [JSON.stringify(userRefs)]);

  return { quizzes, loading, error };
};
