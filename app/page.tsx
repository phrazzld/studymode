"use client";

import Typewriter from "typewriter-effect";
import { topics } from "../constants/topics";
import { useRecommendedQuizzes } from "../hooks/useRecommendedQuizzes";
import { useStore } from "../store";
import Study from "./Study";

// TODO: Stop flickering the unauth'd state before rendering the auth'd state
export default function Home() {
  const { userRefs } = useStore();

  if (userRefs?.firebaseId) {
    return <Profile />;
  }

  return <Promo />;
}

const Profile = () => {
  const { studyMode, setStudyMode } = useStore();
  const { quizzes, loading, error } = useRecommendedQuizzes();

  console.log("recommended quizzes:", quizzes)

  const study = () => {
    setStudyMode(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {studyMode ? (
        <Study quizzes={quizzes} />
      ) : (
        <>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-800 h-14 w-screen">
              Welcome to StudyMode!
            </h1>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="flex flex-row items-center justify-center mt-10">
              {quizzes.length > 0 ? (
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-10"
                  disabled={loading || error}
                  onClick={study}
                >
                  Study
                </button>
              ) : (
                <p className="text-gray-500">You're good!</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Promo = () => {
  // Shuffle topics
  const shuffledTopics = topics.sort(() => 0.5 - Math.random());

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div>
        <p className="text-xl font-sm">I want to learn...</p>
      </div>
      <div className="text-center">
        <h1 className={` text-5xl font-bold text-gray-800 h-14 w-screen`}>
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .typeString("Hello World!")
                .callFunction(() => {
                  console.log("String typed out!");
                })
                .pauseFor(2500)
                .deleteAll()
                .callFunction(() => {
                  console.log("All strings were deleted");
                })
                .start();
            }}
            options={{
              strings: shuffledTopics,
              autoStart: true,
              loop: true,
            }}
          />
        </h1>
        <p className="text-lg font-medium text-gray-600">
          Learn smarter, not harder.
        </p>
      </div>

      <div className="mt-10">
        <p className="text-lg font-medium text-gray-600">
          Create quizzes from your own sources, and test yourself to retain
          information.
        </p>
        <p className="text-lg font-medium text-gray-600">
          Say goodbye to boring memorization and hello to effective learning.
        </p>
      </div>

      <div className="mt-10">
        <a
          href="/auth"
          className="btn bg-blue-500 text-white py-4 px-4 rounded"
        >
          Get Started
        </a>
      </div>
    </div>
  );
};
