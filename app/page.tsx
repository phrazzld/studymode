"use client";

import Study from "@/app/Study";
import { topics } from "@/constants/topics";
import { useRecommendedQuizzes } from "@/hooks/useRecommendedQuizzes";
import { useStore } from "@/store";
import { Quiz } from "@/typings";
import { shuffleArray } from "@/utils";
import { Oval } from "react-loader-spinner";
import Typewriter from "typewriter-effect";

export default function Home() {
  const { userRefs } = useStore();

  if (userRefs?.loaded === false) {
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

  if (userRefs?.firebaseId) {
    return <Profile />;
  }

  return <Promo />;
}

const Profile = () => {
  const { activeQuizzes, setActiveQuizzes } = useStore();
  const { recommendedQuizzes, loading, error } = useRecommendedQuizzes();

  const study = () => {
    const qs = shuffleArray(recommendedQuizzes).map((quiz: Quiz) => ({
      ...quiz,
      answers: shuffleArray(quiz.answers),
    }));
    setActiveQuizzes(qs);
  };

  return (
    <>
      {!!activeQuizzes && activeQuizzes?.length > 0 ? (
        <div className="flex flex-col p-6">
          <Study />
        </div>
      ) : (
        <div className="min-h-screen">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Welcome to StudyMode!
              </h1>
              <p className="text-xl text-gray-600">
                Your personalized learning experience starts here.
              </p>
            </div>

            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            {loading ? (
              <div className="flex justify-center mt-10">
                <Oval
                  height={40}
                  width={40}
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
            ) : (
              <div className="flex flex-col items-center justify-center mt-10">
                {!!recommendedQuizzes && recommendedQuizzes.length > 0 ? (
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white text-2xl font-bold py-5 px-6 rounded"
                    disabled={loading || error}
                    onClick={study}
                  >
                    Study {Math.min(10, recommendedQuizzes.length)} Quizzes
                  </button>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-xl">You're good!</p>
                    <p className="text-gray-500">
                      No quizzes to study. Create some more, or come back later.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
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
                .pauseFor(2500)
                .deleteAll()
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
