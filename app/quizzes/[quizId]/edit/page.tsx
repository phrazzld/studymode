"use client";

import { useQuiz } from "../../../../hooks/useQuiz";
import { Answer } from "../../../../typings";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../../../pages/_app";
import React, { useState } from "react";

type PageProps = {
  params: {
    quizId: string;
  };
};

export default function QuizPage({ params: { quizId } }: PageProps) {
  const { quiz, loading, error } = useQuiz(quizId);

  const editQuiz = () => {
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
    <div>
      <h1>Edit Quiz {quizId}</h1>
    </div>
  )

  /* return ( */
  /*   <div> */
  /*     <h1>Quiz Page: {quizId}</h1> */
  /*     <p>Question: {quiz.question}</p> */
  /*     <ul> */
  /*       {quiz.answers.map((answer: Answer) => ( */
  /*         <li key={answer.text}> */
  /*           {answer.text} (correct: {answer.correct}) */
  /*         </li> */
  /*       ))} */
  /*     </ul> */
  /*   </div> */
  /* ); */
}
