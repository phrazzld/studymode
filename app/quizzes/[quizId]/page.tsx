import React from "react";

type PageProps = {
  params: {
    quizId: string;
  };
};

/* const fetchQuiz = async (quizId: string) => { */
/*   const res = await fetch(`http://localhost:3000/api/quizzes/${quizId}`); */
/*   const quiz = await res.json(); */
/*   return quiz; */
/* } */

export default function QuizPage({ params: { quizId } }: PageProps) {
  /* const quiz = await fetchQuiz(quizId) */
  const quiz = {
    id: 1,
    question: "What is 1 + 1?",
    answers: [
      {
        text: "2",
        correct: true,
      },
      {
        text: "3",
        correct: false,
      },
      {
        text: "7",
        correct: false,
      },
      {
        text: "banana",
        correct: false,
      },
    ],
  };

  return (
    <div>
      <h1>Quiz Page: {quizId}</h1>
      <p>Question: {quiz.question}</p>
      <ul>
        {quiz.answers.map((answer) => (
          <li key={answer.text}>{answer.text}</li>
        ))}
      </ul>
    </div>
  );
}
