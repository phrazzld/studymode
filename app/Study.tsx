"use client";

import { addDoc, collection, doc } from "firebase/firestore";
import { useState } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { createSource, generateQuizzes } from "../firebase";
import { auth, db } from "../pages/_app";
import { useStore } from "../store";
import { Answer, Quiz } from "../typings";

export default function Study() {
  const [submittedAnswer, setSubmittedAnswer] = useState<Answer | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const {
    activeQuizzes: quizzes,
    setActiveQuizzes: setQuizzes,
    userRefs,
  } = useStore();

  if (!quizzes) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-2xl font-bold text-gray-800">Loading...</p>
      </div>
    );
  }

  const quiz = quizzes[quizIndex];

  const submitAnswer = (answer: Answer) => {
    setSubmittedAnswer(answer);
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
    setSubmittedAnswer(null);
    setQuizIndex(quizIndex + 1);
  };

  if (quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-2xl font-bold text-gray-800">You're good!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <CloseButton onClick={() => setQuizzes(null)} />
      <h1 className="text-2xl font-bold py-2 px-4">Study</h1>
      <QuizHeader quiz={quiz} quizIndex={quizIndex} quizzes={quizzes} />
      <AnswersList
        quiz={quiz}
        submittedAnswer={submittedAnswer}
        submitAnswer={submitAnswer}
      />
      <AnswerResult
        quiz={quiz}
        correct={!!submittedAnswer ? submittedAnswer.correct : null}
      />
      <StudySummary
        quizzes={quizzes}
        quizIndex={quizIndex}
        correct={!!submittedAnswer ? submittedAnswer.correct : null}
        correctCount={correctCount}
        onFinishClick={() => setQuizzes(null)}
        onNextClick={nextQuiz}
      />
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end p-2">
      <button className="text-gray-500 hover:text-gray-700" onClick={onClick}>
        <AiOutlineCloseCircle size={24} />
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
  submittedAnswer,
  submitAnswer,
}: {
  quiz: Quiz;
  submittedAnswer: Answer | null;
  submitAnswer: (answer: Answer) => void;
}) {
  const answers = quiz.answers;

  return (
    <ul className="grid gap-2">
      {answers.map((answer: Answer) => (
        <li
          key={answer.text}
          className={`flex items-center cursor-pointer py-3 px-4 rounded-md ${
            submittedAnswer !== null && answer.correct
              ? "bg-green-500 text-white"
              : "bg-white text-gray-800"
          } ${
            submittedAnswer !== null && submittedAnswer.text === answer.text
              ? "ins-shadow"
              : "shadow-lg"
          } ${
            submittedAnswer !== null &&
            submittedAnswer.text === answer.text &&
            !submittedAnswer.correct
              ? "border-2 border-red-500"
              : ""
          }`}
          onClick={() => submittedAnswer === null && submitAnswer(answer)}
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

  return (
    <div
      className={`flex items-center justify-center rounded-md py-10 px-4 text-lg font-bold ${
        correct ? "text-green-600" : "text-red-600"
      }`}
    >
      {correct ? "Correct!" : "Incorrect!"}
      {!!quiz.sourceId && (
        <a
          href={`/sources/${quiz.sourceId}`}
          className="ml-4 text-gray-500 underline hover:text-gray-400"
        >
          See source
        </a>
      )}
    </div>
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
  if (correct !== null) {
    return (
      <div>
        <GenerateFollowUpQuizzesButton quiz={quizzes[quizIndex]} />
        {quizIndex === quizzes.length - 1 ? (
          <>
            <p className="text-2xl font-bold my-4">Done!</p>
            <p className="text-2xl font-bold my-4">
              {correctCount} / {quizzes.length} correct
            </p>
            <FinishButton onFinishClick={onFinishClick} />
          </>
        ) : (
          <NextQuizButton onNextClick={onNextClick} />
        )}
      </div>
    );
  }

  return <></>;
}

function GenerateFollowUpQuizzesButton({ quiz }: { quiz: Quiz }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [finishedGenerating, setFinishedGenerating] = useState(false);
  const { userRefs } = useStore();

  const generateFollowUpQuizzes = async (followUpType: "easy" | "hard") => {
    try {
      setIsGenerating(true);
      if (!auth.currentUser) {
        console.log("No user logged in");
        return;
      }

      // Throw an error if userRefs or userRefs.memreId is null
      if (!userRefs?.memreId) {
        throw new Error("No Memre user id");
      }

      // Craft input for smart creating the source from the quiz
      const correctAnswer = quiz.answers.find((answer) => answer.correct);
      const input =
        followUpType === "easy"
          ? `Help! I'm stuck on the following question: "${quiz.question}". I don't understand why "${correctAnswer}" is correct. Can you help me better understand this?`
          : `This quiz is too easy! I already know the answer to this question way too well: "${quiz.question}". Can you give me some more challenging material that expand my knowledge of this subject?`;

      // Create source
      const { sourceText, sourceDoc } = await createSource(input);

      // Create quizzes
      await generateQuizzes(sourceText, sourceDoc, userRefs.memreId);

      setFinishedGenerating(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (finishedGenerating) {
    return (
      <div className="text-2xl font-bold my-4">
        <p>Follow-up quizzes generated!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center">
      <button
        className="bg-sky-400 hover:bg-sky-700 text-white font-bold py-3 px-6 mr-10 rounded-md transition-colors duration-300 ease-in-out"
        onClick={() => generateFollowUpQuizzes("easy")}
        disabled={isGenerating}
      >
        Autogenerate Easier Quizzes
      </button>
      <button
        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300 ease-in-out"
        onClick={() => generateFollowUpQuizzes("hard")}
        disabled={isGenerating}
      >
        Autogenerate Harder Quizzes
      </button>
    </div>
  );
}

function FinishButton({ onFinishClick }: { onFinishClick: () => void }) {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300 ease-in-out"
      onClick={onFinishClick}
    >
      Finish
    </button>
  );
}

function NextQuizButton({ onNextClick }: { onNextClick: () => void }) {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300 ease-in-out"
      onClick={onNextClick}
    >
      Next
    </button>
  );
}
