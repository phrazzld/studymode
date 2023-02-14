"use client";

import Link from "next/link";
import { useState } from "react";
import { SAMPLE_SOURCE_CONTENT } from "../../../constants/sampleSourceContent";
import { useCreateQuizzes } from "../../../hooks/useCreateQuizzes";

export default function CreateQuiz() {
  const [selectedOption, setSelectedOption] = useState<
    "classic" | "smart" | null
  >(null);

  const handleOptionClick = (option: "classic" | "smart"): void => {
    setSelectedOption(option);
  };

  // TODO: Better "generating..." state / UX
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Create</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-screen-lg">
        <div
          className={`${
            selectedOption === "classic" ? "bg-blue-500 text-white" : "bg-white"
          } flex items-center justify-center flex-col p-8 rounded-lg shadow-lg cursor-pointer`}
          onClick={() => handleOptionClick("classic")}
        >
          <h2 className="text-2xl font-bold mb-4">Classic</h2>
          <p className="text-gray-700 mb-8">
            Type or paste text, and we'll extract quizzes from it.
          </p>
        </div>
        <div className="bg-gray-100 flex items-center justify-center flex-col p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">Smart</h2>
          <h3 className="text-xl text-gray-400 mb-4">Coming soon</h3>
          <p className="text-gray-700 mb-8">
            Explain what you want to learn and we'll do the rest.
          </p>
        </div>

        {/* <div */}
        {/*   className={`${ */}
        {/*     selectedOption === "smart" ? "bg-blue-500 text-white" : "bg-white" */}
        {/*   } flex items-center justify-center flex-col p-8 rounded-lg shadow-lg cursor-pointer`} */}
        {/*   onClick={() => handleOptionClick("smart")} */}
        {/* > */}
        {/*   <h2 className="text-2xl font-bold mb-4">Smart</h2> */}
        {/*   <p className="text-gray-700 mb-8"> */}
        {/*     Explain what you want to learn and we'll do the rest. */}
        {/*   </p> */}
        {/* </div> */}
      </div>

      {selectedOption === "classic" && <ClassicForm />}
    </div>
  );
}

// TODO: Obviate need for character limit enforcement
function ClassicForm() {
  const [source, setSource] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { createQuizzes, quizzes, loading, error } = useCreateQuizzes(source);

  const getRandomSourceContent = (): void => {
    const randomIndex = Math.floor(
      Math.random() * SAMPLE_SOURCE_CONTENT.length
    );
    setSource(SAMPLE_SOURCE_CONTENT[randomIndex]);
  };

  const handleCreateQuizzes = (): void => {
    if (source.length > 1000) {
      setValidationError("Source content must be less than 1000 characters");
    } else {
      setValidationError("");
      createQuizzes();
    }
  };

  return (
    <div className="mt-10">
      <div>
        <textarea
          rows={10}
          cols={110}
          className="resize-none w-full p-2 border border-gray-300 rounded-lg shadow-lg"
          placeholder="Enter your source content here to generate quizzes from it"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <div className="mt-4 flex justify-between">
          <div>
            <button
              className={`bg-blue-500 text-white font-medium py-2 px-4 rounded-lg ${
                loading ? "cursor-not-allowed opacity-50" : "hover:bg-blue-600"
              }`}
              onClick={handleCreateQuizzes}
              disabled={loading}
            >
              Generate Quizzes
            </button>
            <button
              className={`ml-4 text-blue-500 font-medium ${
                loading
                  ? "cursor-not-allowed opacity-50}"
                  : "hover:text-blue-600"
              }`}
              onClick={getRandomSourceContent}
              disabled={loading}
            >
              Get example
            </button>
          </div>
          <div
            className={`p-2 rounded-lg text-sm ${
              source.length > 1000
                ? "bg-red-100 text-red-500"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {source.length}/1000
          </div>
        </div>
      </div>
      {(error || validationError) && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
          <p>An error occurred: {error || validationError}</p>
        </div>
      )}
      {quizzes.length > 0 && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg">
          <p>Quizzes successfully created!</p>
          <Link href="/quizzes">
            <p className="text-blue-500 hover:text-blue-600 font-medium">
              View Quizzes
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}
