"use client";

import { addDoc, collection, doc } from "firebase/firestore";
import { useState } from "react";
import { useQuizzes } from "../../hooks/useQuizzes";
import { auth, db } from "../../pages/_app";
import { Answer } from "../../typings";

// What does the UX look like for study?
// To start, I think we can just pull all of the quizzes for the current user
// - Though ultimately we'll just be pulling quizzes the LE API says need review
// - And perhaps enabling filtering by source / tag / etc
// So we pull all the quizzes
// Show the first one: question and answers
// User selects an answer
// If correct, show a "correct" message
// If incorrect, show a "incorrect" message, and include a link to the quiz source
// Save the result to the presentations subcollection under quizzes
// Show a "next" button
// If there are no more quizzes, show a "done" message as well as stats on how many were correct / incorrect

export default function Study() {
  const { quizzes, loading, error } = useQuizzes();
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const quiz = quizzes[quizIndex];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!quiz) {
    return (
      <div>
        <h1>No quizzes found.</h1>
      </div>
    );
  }

  const submitAnswer = (answer: Answer) => {
    setCorrect(answer.correct);
    if (answer.correct) {
      setCorrectCount(correctCount + 1);
    }

    const user = auth.currentUser;
    if (!user) {
      console.error("No user found");
      return;
    }

    addDoc(
      collection(
        doc(db, "users", user.uid, "quizzes", quiz.id),
        "presentations"
      ),
      {
        answer: answer.text,
        correct: answer.correct,
        createdAt: new Date(),
      }
    );
  };

  const nextQuiz = () => {
    setCorrect(null);
    setQuizIndex(quizIndex + 1);
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold py-2 px-4">Study</h1>
      <p className="my-5 px-4">
        Question {quizIndex + 1}/{quizzes.length}: {quiz.question}
      </p>
      <ul className="flex flex-col">
        {quiz.answers.map((answer: Answer) => (
          <li
            key={answer.text}
            className={`${correct === null ? "cursor-pointer" : ""} ${
              correct !== null && !answer.correct ? "border-red-500" : ""
            } ${
              correct !== null && answer.correct ? "border-green-500" : ""
            } my-2 px-4 py-2 border rounded-md`}
            onClick={() => correct === null && submitAnswer(answer)}
          >
            {answer.text}
          </li>
        ))}
      </ul>
      {correct === null ? null : correct ? (
        <p className="text-green-500">Correct!</p>
      ) : (
        <p className="text-red-500">
          Incorrect!{" "}
          {!!quiz.sourceId && (
            <a href={`/sources/${quiz.sourceId}`} className="underline">
              See source
            </a>
          )}
        </p>
      )}
      {quizIndex === quizzes.length - 1 && correct !== null ? (
        <>
          <p className="text-2xl font-bold">Done!</p>
          <p className="text-2xl font-bold">
            {correctCount} / {quizzes.length} correct
          </p>
        </>
      ) : correct !== null ? (
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={nextQuiz}
        >
          Next
        </button>
      ) : null}
    </div>
  );
}
