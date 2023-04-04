"use client";

import { useQuiz } from "@/hooks/useQuiz";
import { auth, db } from "@/pages/_app";
import { Answer } from "@/typings";
import { deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { BsCheckSquareFill, BsFillXSquareFill } from "react-icons/bs";
import { Oval } from "react-loader-spinner";

type PageProps = {
  params: {
    quizId: string;
  };
};

export default function QuizPage({ params: { quizId } }: PageProps) {
  const { quiz, loading, error } = useQuiz(quizId);

  const deleteQuiz = async () => {
    const confirmation = confirm("Are you sure you want to delete this quiz?");
    if (!confirmation) {
      return;
    }

    try {
      if (!auth.currentUser) {
        throw new Error("Cannot delete quiz. Not logged in.");
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      const quizRef = doc(userRef, "quizzes", quizId);
      await deleteDoc(quizRef);

      // Delete embedding from Pinecone index
      await fetch("/api/embeddings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: quizId,
          userId: auth.currentUser.uid,
        }),
      });

      // Redirect to quizzes page
      window.location.href = "/quizzes";
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Oval
          height={80}
          width={80}
          color="rgb(59 130 246)"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
          ariaLabel="oval-loading"
          secondaryColor="rgb(59 130 246)"
          strokeWidth={2}
          strokeWidthSecondary={2}
        />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <div className="flex flex-col p-6 max-w-screen-sm mx-auto">
      <h1 className="text-2xl font-medium mb-1">{quiz.question}</h1>
      <ul className="text-lg font-medium my-4">
        {quiz.answers.map((answer: Answer) => (
          <li key={answer.text} className="flex flex-row items-center mb-2">
            {answer.correct ? (
              <BsCheckSquareFill className="inline-block mr-2 text-green-500" />
            ) : (
              <BsFillXSquareFill className="inline-block mr-2 text-red-500" />
            )}
            <p>{answer.text}</p>
          </li>
        ))}
      </ul>

      <div className="flex justify-between my-4">
        <div>
          <Link href="/sources/[sourceId]" as={`/sources/${quiz.sourceId}`}>
            <button className="bg-white-500 hover:bg-blue-500 hover:text-white py-2 px-4 rounded mr-4 border-2 border-blue-500">
              View Source
            </button>
          </Link>
        </div>

        <div>
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
    </div>
  );
}
