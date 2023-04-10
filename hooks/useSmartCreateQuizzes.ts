import { createSource, generateQuizzes } from "@/firebase";
import { auth, db } from "@/pages/_app";
import { useStore } from "@/store";
import { Quiz } from "@/typings";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";

export const useSmartCreateQuizzes = (prompt: string) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userRefs } = useStore();

  const smartCreateQuizzes = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!auth.currentUser) {
        console.warn("No user logged in");
        return;
      }

      const user = auth.currentUser;

      // Create user document if one does not already exist
      await getDoc(doc(db, "users", user.uid));

      // Create source
      const { sourceText, sourceDoc } = await createSource(prompt);

      // Create quizzes
      const quizzes = await generateQuizzes(
        sourceText,
        sourceDoc.id,
        userRefs?.memreId || null
      );

      setQuizzes(quizzes);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { smartCreateQuizzes, quizzes, loading, error };
};
