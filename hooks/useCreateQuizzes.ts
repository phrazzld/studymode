import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../pages/_app";

export const useCreateQuizzes = (source: string) => {
  const createQuizzes = async () => {
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
      }
    );

    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source }),
    });

    const { quizzes } = await response.json();

    // Save quizzes to users/quizzes subcollection
    quizzes.forEach(async (quiz: any) => {
      await addDoc(collection(db, "users", user.uid, "quizzes"), {
        sourceId: sourceDoc.id,
        ...quiz,
      });
    });
  };

  return createQuizzes;
};
