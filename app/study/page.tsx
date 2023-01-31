'use client'

import React from "react";
import { Answer } from '../../typings'

export default function Study() {
  // Create stub quiz
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

  const submitAnswer = (answer: Answer) => {
    console.log("Submitting answer", answer);
    if (answer.correct) {
      console.log("Correct!");
    } else {
      console.log("Incorrect!");
    }
  };

  return (
    <div>
      <h1>Study</h1>
      <p>Question: {quiz.question}</p>
      <ul>
        {quiz.answers.map((answer: Answer) => (
          <li key={answer.text} onClick={() => submitAnswer(answer)}>{answer.text}</li>
        ))}
      </ul>
    </div>
  );
}
