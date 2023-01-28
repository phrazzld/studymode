"use client";

import { useQuiz } from "../../../hooks/useQuiz";
import { Answer } from "../../../typings";

type PageProps = {
  params: {
    quizId: string;
  };
};

export default function QuizPage({ params: { quizId } }: PageProps) {
  const { quiz, loading, error } = useQuiz(quizId);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div>
      <h1>Quiz Page: {quizId}</h1>
      <p>Question: {quiz.question}</p>
      <ul>
        {quiz.answers.map((answer: Answer) => (
          <li key={answer.text}>{answer.text} (correct: {answer.correct})</li>
        ))}
      </ul>
    </div>
  );
}
