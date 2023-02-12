import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../pages/_app";
import { useStore } from "../store";
import { Quiz } from "../typings";

export const useQuiz = (quizId: string) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { userRefs } = useStore();

  // Fetch quizzes from Firestore
  const fetchQuiz = async () => {
    try {
      if (!userRefs) {
        return;
      }

      if (!userRefs.firebaseId) {
        return;
      }

      const quizRef = doc(db, "users", userRefs.firebaseId, "quizzes", quizId);
      const quizSnapshot = await getDoc(quizRef);
      if (!quizSnapshot.exists()) {
        console.log("No quiz found.");
        setQuiz(null);
        return;
      }
      const quizData = quizSnapshot.data();
      setQuiz(quizData as Quiz);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [JSON.stringify(userRefs)]);

  return { quiz, loading, error };
};
