"use client";

import { useQuizzes } from "@/hooks/useQuizzes";
import { Quiz } from "@/typings";
import { formatDate } from "@/utils";
import Link from "next/link";
import { Oval } from "react-loader-spinner";

export default function QuizzesList() {
  const { quizzes, loading, error } = useQuizzes();

  const sortedQuizzes = quizzes.sort((a, b) => {
    const aCreatedAt =
      a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1000000;
    const bCreatedAt =
      b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1000000;
    return bCreatedAt - aCreatedAt;
  });

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
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {sortedQuizzes.length > 0 ? (
        <ul className="space-y-6">
          {sortedQuizzes.map((quiz: Quiz) => (
            <Link href={`/quizzes/${quiz.id}`}>
              <li
                key={quiz.id}
                className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 p-6 rounded-lg my-4"
              >
                <p>{quiz.question}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatDate(quiz.createdAt)}
                </p>
              </li>
            </Link>
          ))}
        </ul>
      ) : (
        <div className="text-center my-20">
          <p className="text-lg font-medium">No quizzes yet!</p>
          <p className="text-sm text-gray-500">Create a quiz to get started.</p>
        </div>
      )}
    </>
  );
}
