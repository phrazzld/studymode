import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "./pages/_app";
import { Quiz } from "./typings";

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

    console.debug("Sending POST request to /api/sources...");
    const response = await fetch("/api/sources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });
    console.debug("Response received from POST request to /api/sources sent.");

    // If the response is not ok, throw an error
    if (!response.ok) {
      console.error(response);
      throw new Error("Error creating source");
    }

    const { source } = await response.json();

    // Save source to users/sources subcollection
    console.debug("Saving source to Firestore...");
    const sourceDoc = await addDoc(
      collection(db, "users", user.uid, "sources"),
      {
        title: source.split(" ").slice(0, 5).join(" ").concat("..."),
        text: source,
        createdAt: new Date(),
      }
    );
    console.debug("Source saved to Firestore.");

    // Add source to Pinecone index
    console.debug("Adding source to Pinecone index...");
    await fetch("/api/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType: "source",
        data: sourceDoc,
        userId: user.uid,
      }),
    });
    console.debug("Source added to Pinecone index.");

    return { sourceText: source, sourceDoc };
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const generateQuizzes = async (
  sourceText: string,
  sourceDoc: any,
  memreUserId: string
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
    quizzes.forEach(async (quiz: Quiz) => {
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
        body: JSON.stringify({
          firebaseId: user.uid,
          memreUserId: memreUserId,
        }),
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

    return quizzes;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};
