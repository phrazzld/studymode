"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuizzes } from "../../hooks/useQuizzes";
import { Quiz } from "../../typings";

export default function QuizzesList() {
  const { quizzes, loading, error } = useQuizzes();
  const [pageLoading, setPageLoading] = useState(true);

  // Sort quizzes by createdAt
  // createdAt is an object containing seconds and nanoseconds
  // We need to convert it to a number so we can sort it
  const sortedQuizzes = quizzes.sort((a, b) => {
    const aCreatedAt =
      a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1000000;
    const bCreatedAt =
      b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1000000;
    return bCreatedAt - aCreatedAt;
  });

  // When loading changes, set a timer to update pageLoading in 1 second
  // This is to prevent the page from flickering when loading is false
  // but the page is still loading
  // Clear the timeout if loading is false and quizzes.length > 0
  useEffect(() => {
    if (sortedQuizzes.length > 0) {
      setPageLoading(false);
    } else if (!loading && quizzes.length === 0) {
      const timer = setTimeout(() => setPageLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, JSON.stringify(quizzes)]);

  if (pageLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {sortedQuizzes.length > 0 ? (
        <ul className="space-y-4">
          {sortedQuizzes.map((quiz: Quiz) => (
            <li key={quiz.id} className="flex items-center">
              <Link
                href={`/quizzes/${quiz.id}`}
                className="text-blue-500 font-medium"
              >
                {quiz.question}
              </Link>
            </li>
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
