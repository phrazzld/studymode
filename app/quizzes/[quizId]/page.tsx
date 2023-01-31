"use client";

import { useQuiz } from "../../../hooks/useQuiz";
import Link from "next/link";
import { Answer } from "../../../typings";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../../pages/_app";

type PageProps = {
  params: {
    quizId: string;
  };
};

export default function QuizPage({ params: { quizId } }: PageProps) {
  const { quiz, loading, error } = useQuiz(quizId);

  /* const editQuiz = () => { */
  /*   // TODO: Redirect to edit quiz page */
  /*   window.location.href = `/quizzes/${quizId}/edit`; */
  /* }; */

  const deleteQuiz = async () => {
    // TODO: Prompt for confirmation

    try {
      if (!auth.currentUser) {
        throw new Error("Cannot delete quiz. Not logged in.");
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      const quizRef = doc(userRef, "quizzes", quizId);
      await deleteDoc(quizRef);

      // Redirect to quizzes page
      window.location.href = "/quizzes";
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <div>
      <h1>Quiz Page: {quizId}</h1>
      <p>Question: {quiz.question}</p>
      <ul>
        {quiz.answers.map((answer: Answer) => (
          <li key={answer.text}>
            {answer.text} (correct: {answer.correct})
          </li>
        ))}
      </ul>

      <div>
        <Link href="/quizzes/[quizId]/edit" as={`/quizzes/${quizId}/edit`}>
          <button>Edit</button>
        </Link>
        <button onClick={deleteQuiz}>Delete</button>
      </div>
    </div>
  );
}
