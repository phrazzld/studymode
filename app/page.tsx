import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800">studymode</h1>
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
          href="/quizzes"
          className="btn bg-blue-500 text-white py-4 px-4 rounded"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
