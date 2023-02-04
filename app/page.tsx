"use client";

import Typewriter from "typewriter-effect";
import { topics } from "../constants/topics";
import { useStore } from "../store";

export default function Home() {
  const { userRefs } = useStore();

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
          href={`${userRefs?.firebaseId ? "/quizzes" : "/auth"}`}
          className="btn bg-blue-500 text-white py-4 px-4 rounded"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
