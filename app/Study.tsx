"use client";

import { addDoc, collection, doc } from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "../pages/_app";
import { useStore } from "../store";
import { Answer, Quiz } from "../typings";

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

interface StudyProps {
  quizzes: Quiz[];
}

export default function Study(props: StudyProps) {
  const { quizzes } = props;
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const { userRefs, setStudyMode } = useStore();
  const quiz = quizzes[quizIndex];

  console.log("Study :: quizzes", quizzes);

  const submitAnswer = (answer: Answer) => {
    console.log("Submitting answer", answer);
    setCorrect(answer.correct);
    if (answer.correct) {
      setCorrectCount(correctCount + 1);
    }

    const user = auth.currentUser;
    if (!user) {
      console.error("No user found");
      return;
    }

    if (!userRefs) {
      console.error("No user refs found");
      return;
    }

    // POST to the LE API to save the presentation
    fetch("/api/study", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firebaseId: userRefs.firebaseId,
        memreItemId: quiz.memreId,
        memreUserId: userRefs.memreId,
        quizResult: answer.correct ? "Correct" : "Incorrect",
      }),
    });

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
      <CloseButton onClick={() => setStudyMode(false)} />
      <h1 className="text-2xl font-bold py-2 px-4">Study</h1>
      <QuizHeader quiz={quiz} quizIndex={quizIndex} quizzes={quizzes} />
      <AnswersList quiz={quiz} correct={correct} submitAnswer={submitAnswer} />
      <AnswerResult quiz={quiz} correct={correct} />
      <StudySummary
        quizzes={quizzes}
        quizIndex={quizIndex}
        correct={correct}
        correctCount={correctCount}
        onFinishClick={() => setStudyMode(false)}
        onNextClick={nextQuiz}
      />
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end py-2 px-4">
      <button className="text-gray-500 hover:text-gray-700" onClick={onClick}>
        Close
      </button>
    </div>
  );
}

function QuizHeader({
  quiz,
  quizIndex,
  quizzes,
}: {
  quiz: Quiz;
  quizIndex: number;
  quizzes: Quiz[];
}) {
  return (
    <p className="my-5 px-4">
      Question {quizIndex + 1}/{quizzes.length}: {quiz.question}
    </p>
  );
}

function AnswersList({
  quiz,
  correct,
  submitAnswer,
}: {
  quiz: Quiz;
  correct: boolean | null;
  submitAnswer: (answer: Answer) => void;
}) {
  return (
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
  );
}

function AnswerResult({
  quiz,
  correct,
}: {
  quiz: Quiz;
  correct: boolean | null;
}) {
  if (correct === null) {
    return <></>;
  }

  if (correct) {
    return <p className="text-green-500">Correct!</p>;
  }

  return (
    <p className="text-red-500">
      Incorrect!{" "}
      {!!quiz.sourceId && (
        <a href={`/sources/${quiz.sourceId}`} className="underline">
          See source
        </a>
      )}
    </p>
  );
}

function StudySummary({
  quizzes,
  quizIndex,
  correct,
  correctCount,
  onFinishClick,
  onNextClick,
}: {
  quizzes: Quiz[];
  quizIndex: number;
  correct: boolean | null;
  correctCount: number;
  onFinishClick: () => void;
  onNextClick: () => void;
}) {
  if (quizIndex === quizzes.length - 1 && correct !== null) {
    return (
      <>
        <p className="text-2xl font-bold">Done!</p>
        <p className="text-2xl font-bold">
          {correctCount} / {quizzes.length} correct
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onFinishClick}
        >
          Finish
        </button>
      </>
    );
  }

  if (correct !== null) {
    return (
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded"
        onClick={onNextClick}
      >
        Next
      </button>
    );
  }

  return <></>;
}
