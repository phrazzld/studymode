import { auth, db } from "@/pages/_app";
import { Quiz } from "@/typings";
import { addDoc, collection } from "firebase/firestore";

type CreateSourceResponse = {
  sourceText: string;
  sourceDoc: any;
};

export const createSource = async (
  input: string
): Promise<CreateSourceResponse> => {
  try {
    if (!auth.currentUser) {
      console.error("No user logged in");
      throw new Error("No user logged in");
    }
    const user = auth.currentUser;

    const response = await fetch("/api/sources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    // If the response is not ok, throw an error
    if (!response.ok) {
      console.error(response);
      throw new Error("Error creating source");
    }

    const { source } = await response.json();

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

    return { sourceText: source, sourceDoc };
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const generateQuizzes = async (
  sourceText: string,
  sourceId: string,
  memreUserId: string | null
): Promise<Quiz[]> => {
  try {
    if (!auth.currentUser) {
      console.error("No user logged in");
      throw new Error("No user logged in");
    }
    const user = auth.currentUser;
    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source: sourceText }),
    });

    // If the response is not ok, throw an error
    if (!response.ok) {
      console.error(response);
      const errResponse = await response.json();
      console.error(errResponse);
      throw new Error("Error creating quizzes");
    }

    const { quizzes } = await response.json();

    // Save quizzes to users/quizzes subcollection
    const saveQuizPromises = quizzes.map(async (quiz: Quiz) => {
      // Convert quiz.answers.map(a => a.correct) to booleans
      const answers = quiz.answers.map((a: any) => ({
        ...a,
        correct: a.correct === "true" || a.correct === true,
      }));

      let memreItemId = "";
      if (memreUserId) {
        // Get memreId from /api/memre-items
        // TODO: Elegantly handle rate limiting
        const memreResponse = await fetch("/api/memre-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firebaseId: user.uid,
            memreUserId: memreUserId,
          }),
        });

        const { memreId } = await memreResponse.json();
        memreItemId = memreId;
      }

      const createdAt = new Date();
      const quizDoc = await addDoc(
        collection(db, "users", user.uid, "quizzes"),
        {
          memreId: memreItemId || "",
          sourceId: sourceId,
          question: quiz.question,
          answers,
          createdAt: createdAt,
        }
      );

      // Add quiz to Pinecone index
      await fetch("/api/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: "quiz",
          data: {
            id: quizDoc.id,
            question: quiz.question,
            answers: quiz.answers,
            createdAt: createdAt,
          },
          userId: user.uid,
        }),
      });
    });

    await Promise.all(saveQuizPromises);

    return quizzes;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};
