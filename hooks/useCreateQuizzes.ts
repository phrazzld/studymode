import { generateQuizzes } from "@/firebase";
import { auth, db } from "@/pages/_app";
import { useStore } from "@/store";
import { Quiz } from "@/typings";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useState } from "react";

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
        console.warn("No user logged in");
        return;
      }

      const user = auth.currentUser;

      // Throw an error if userRefs or userRefs.memreId is null
      if (!userRefs?.memreId) {
        throw new Error("No Memre user id");
      }

      // Create user document if one does not already exist
      await getDoc(doc(db, "users", user.uid));

      // Save source to users/sources subcollection
      const sourceTitle = source.split(" ").slice(0, 5).join(" ").concat("...");
      const createdAt = new Date();
      const sourceDoc = await addDoc(
        collection(db, "users", user.uid, "sources"),
        {
          title: sourceTitle,
          text: source,
          createdAt: createdAt,
        }
      );

      // Add source to Pinecone index
      await fetch("/api/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: "source",
          data: {
            id: sourceDoc.id,
            title: sourceTitle,
            text: source,
            createdAt: createdAt,
          },
          userId: user.uid,
        }),
      });

      // Create quizzes
      const qs = await generateQuizzes(source, sourceDoc, userRefs.memreId);

      setQuizzes(qs);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { createQuizzes, quizzes, loading, error };
};
