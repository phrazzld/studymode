"use client";

import QuizzesList from "@/app/quizzes/QuizzesList";
import Study from "@/app/Study";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useStore } from "@/store";
import { Quiz } from "@/typings";
import { shuffleArray } from "@/utils";

export default function Quizzes() {
  const { quizzes, loading, error } = useQuizzes();
  const { activeQuizzes, setActiveQuizzes } = useStore();

  const study = (): void => {
    const qs = shuffleArray(quizzes).map((quiz: Quiz) => ({
      ...quiz,
      answers: shuffleArray(quiz.answers),
    }));
    setActiveQuizzes(qs);
  };

  return (
    <div className="p-4">
      {!!activeQuizzes && !error && !loading ? (
        <Study />
      ) : (
        <>
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-medium">Quizzes</h1>

            {error && <p className="text-red-500">{error}</p>}

            <div className="flex">
              <button
                onClick={study}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
              >
                Study All
              </button>
            </div>
          </div>

          <QuizzesList />
        </>
      )}
    </div>
  );
}
