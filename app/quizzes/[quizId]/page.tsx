"use client";

import { deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { useQuiz } from "../../../hooks/useQuiz";
import { auth, db } from "../../../pages/_app";
import { Answer } from "../../../typings";

type PageProps = {
  params: {
    quizId: string;
  };
};

export default function QuizPage({ params: { quizId } }: PageProps) {
  const { quiz, loading, error } = useQuiz(quizId);

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
    <div className="flex flex-col p-6 max-w-screen-sm mx-auto">
      <h1 className="text-2xl font-medium mb-4">Quiz Page: {quizId}</h1>
      <Link href="/sources/[sourceId]" as={`/sources/${quiz.sourceId}`}>
        <p className="text-blue-500 underline">Source: {quiz.sourceId}</p>
      </Link>
      <p className="text-lg font-medium mb-4">Question: {quiz.question}</p>
      <ul className="text-lg font-medium mb-4">
        {quiz.answers.map((answer: Answer) => (
          <li key={answer.text} className="mb-2">
            {answer.text} (correct: {answer.correct.toString()})
          </li>
        ))}
      </ul>

      <div className="flex">
        <Link href="/quizzes/[quizId]/edit" as={`/quizzes/${quizId}/edit`}>
          <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4">
            Edit
          </button>
        </Link>
        <button
          onClick={deleteQuiz}
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
