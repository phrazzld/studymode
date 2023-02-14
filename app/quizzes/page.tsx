"use client";

import { shuffleArray } from '../../utils';
import { useQuizzes } from "../../hooks/useQuizzes";
import { useStore } from "../../store";
import Study from "../Study";
import QuizzesList from "./QuizzesList";

export default function Quizzes() {
  const { quizzes, loading, error } = useQuizzes();
  const { studyMode, setStudyMode } = useStore();

  return (
    <div className="p-4">
      {studyMode && !error && !loading ? (
        <Study quizzes={shuffleArray(quizzes)} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-medium">Quizzes</h1>

            {error && <p className="text-red-500">{error}</p>}

            <div className="flex">
              <button
                onClick={() => setStudyMode(true)}
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
