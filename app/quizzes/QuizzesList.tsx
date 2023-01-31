"use client";

import Link from "next/link";
import { useQuizzes } from "../../hooks/useQuizzes";

export default function QuizzesList() {
  const { quizzes, loading, error } = useQuizzes();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ul className="space-y-4">
      {quizzes.map((quiz) => (
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
  );
}
