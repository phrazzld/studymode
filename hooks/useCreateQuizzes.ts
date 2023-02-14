import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useStore } from '../store'
import { useState } from "react";
import { auth, db } from "../pages/_app";
import { Quiz } from "../typings";

export const useCreateQuizzes = (source: string) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userRefs } = useStore();

  const createQuizzes = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!auth.currentUser) {
        console.log("No user logged in");
        return;
      }

      const user = auth.currentUser;

      // Create user document if one does not already exist
      await getDoc(doc(db, "users", user.uid));

      // Save source to users/sources subcollection
      const sourceDoc = await addDoc(
        collection(db, "users", user.uid, "sources"),
        {
          text: source,
          createdAt: new Date(),
        }
      );

      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source }),
      });

      // If the response is not ok, throw an error
      if (!response.ok) {
        const errResponse = await response.json();
        setError(errResponse.error);
        return;
      }

      const { quizzes } = await response.json();

      if (!userRefs?.memreId) {
        console.error("No Memre user id");
        return;
      }

      // Save quizzes to users/quizzes subcollection
      quizzes.forEach(async (quiz: any) => {
        // Convert quiz.answers.map(a => a.correct) to booleans
        const answers = quiz.answers.map((a: any) => ({
          ...a,
          correct: a.correct === "true",
        }));

        // Get memreId from /api/memre-items
        // TODO: Elegantly handle rate limiting
        const memreResponse = await fetch("/api/memre-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firebaseId: user.uid, memreUserId: userRefs.memreId }),
        });

        const { memreId } = await memreResponse.json();

        await addDoc(collection(db, "users", user.uid, "quizzes"), {
          memreId: memreId,
          sourceId: sourceDoc.id,
          question: quiz.question,
          answers,
          createdAt: new Date(),
        });
      });

      setQuizzes(quizzes);
    } catch (err: any) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { createQuizzes, quizzes, loading, error };
};
