import { collection, doc, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../pages/_app";

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  // Fetch quizzes from Firestore
  // The user has a sources subcollection, and each source document has a quizzes subcollection
  const fetchQuizzes = async () => {
    // Set the userId to the current user's uid
    const userId = auth.currentUser?.uid;

    try {
      if (!userId) {
        return;
      }
      // Get the user
      const userRef = doc(db, "users", userId);

      // Get the user's sources
      let sources: any[] = [];
      const sourcesQuery = query(collection(db, "users", userId, "sources"));
      const sourcesSnapshot = await getDocs(sourcesQuery);
      if (sourcesSnapshot.empty) {
        console.log("No sources.");
        return;
      }
      sourcesSnapshot.forEach((snap: any) => {
        sources.push({ id: snap.id, ...snap.data() });
      });

      let sourceQuizzes: any[] = [];
      if (sources.length > 0) {
        // Get the quizzes for each source
        for (let i = 0; i < sources.length; i++) {
          const source = sources[i];
          const quizzesQuery = query(
            collection(db, "users", userId, "sources", source.id, "quizzes")
          );
          const quizzesSnapshot = await getDocs(quizzesQuery);
          if (quizzesSnapshot.empty) {
            console.log("No quizzes for source " + source.id);
            continue;
          }
          quizzesSnapshot.forEach((snap: any) => {
            sourceQuizzes.push({ id: snap.id, ...snap.data() });
          });
        }
      }

      setQuizzes(sourceQuizzes);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [user]);

  return { quizzes, loading, error };
};
