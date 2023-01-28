"use client";

import Link from "next/link";
import { useQuizzes } from "../../hooks/useQuizzes";
import { auth } from '../../pages/_app'

export default function QuizzesList() {
  const { quizzes, loading, error } = useQuizzes();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {quizzes.map((quiz) => (
        <p key={quiz.id}>
          <Link href={`/quizzes/${quiz.id}`}>Quiz: {quiz.question}</Link>
        </p>
      ))}
    </div>
  );
}
