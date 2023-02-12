"use client";

import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";
import { useQuiz } from "../../../../hooks/useQuiz";
import { auth, db } from "../../../../pages/_app";
import { Answer } from "../../../../typings";

type PageProps = {
  params: {
    quizId: string;
  };
};

export default function EditQuizPage({ params: { quizId } }: PageProps) {
  const { quiz, loading, error } = useQuiz(quizId);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (quiz && !question && answers.length === 0) {
      setQuestion(quiz.question);
      setAnswers(quiz.answers);
    }
  }, [JSON.stringify(quiz)]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!auth.currentUser) {
        throw new Error("Cannot edit quiz. Not logged in.");
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      const quizRef = doc(userRef, "quizzes", quizId);
      await setDoc(quizRef, {
        question,
        answers,
      });

      // Redirect to quizzes page
      window.location.href = "/quizzes";
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAnswerChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newAnswers = [...answers];
    newAnswers[index].text = e.target.value;
    setAnswers(newAnswers);
  };

  const handleCorrectAnswerChange = (
    _e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newAnswers = answers.map((answer, i) => ({
      ...answer,
      correct: i === index,
    }));
    setAnswers(newAnswers);
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
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Edit Quiz Page: {quizId}</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="flex flex-col mb-4">
          <label htmlFor="question" className="font-bold mb-2">
            Question:
          </label>
          <textarea
            className="w-full h-32 border border-gray-400 p-2 mb-4"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <h3 className="font-bold mb-4">Answers:</h3>
        {answers.map((answer: Answer, index: number) => (
          <div key={answer.text} className="flex flex-col mb-4">
            <label htmlFor={`answer-${index}`} className="font-bold mb-2">
              Answer {index + 1}:
            </label>
            <input
              className="border border-gray-400 p-2"
              type="text"
              id={`answer-${index}`}
              value={answer.text}
              onChange={(e) => handleAnswerChange(e, index)}
            />
            <div className="flex items-center mb-2">
              <input
                type="radio"
                name="correct"
                checked={answer.correct}
                onChange={(e) => handleCorrectAnswerChange(e, index)}
              />
              <span className="ml-2">Correct</span>
            </div>
          </div>
        ))}

        <div className="flex justify-between">
          <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Save Changes
          </button>
          <Link href="/quizzes/[quizId]" as={`/quizzes/${quizId}`}>
            <button className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500">
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
