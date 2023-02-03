"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SAMPLE_SOURCE_CONTENT } from "../../../constants/sampleSourceContent";
import { useCreateQuizzes } from "../../../hooks/useCreateQuizzes";

// TODO: Better error handling and UX
// TODO: Add learning goals input
// TODO: Obviate need for character limit enforcement
export default function CreateQuiz() {
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const {
    createQuizzes,
    quizzes,
    loading,
    error: creationError,
  } = useCreateQuizzes(source);

  useEffect(() => {
    if (creationError) {
      setError(creationError);
    }
  }, [creationError]);

  const getRandomSourceContent = (): void => {
    const randomIndex = Math.floor(
      Math.random() * SAMPLE_SOURCE_CONTENT.length
    );
    setSource(SAMPLE_SOURCE_CONTENT[randomIndex]);
  };

  const handleCreateQuizzes = (): void => {
    if (source.length > 1000) {
      setError("Source content must be less than 1000 characters");
    } else {
      setError("");
      createQuizzes();
    }
  };

  return (
    <div className="mt-10">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-medium mb-4">Source Content</h2>
        <textarea
          rows={5}
          cols={30}
          className="resize-none w-full p-2 border border-gray-300 rounded-lg"
          placeholder="Enter your source content here..."
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <div className="mt-4">
          <button
            className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={handleCreateQuizzes}
            disabled={loading}
          >
            Generate Quizzes
          </button>
          <button
            className="ml-4 text-blue-500 hover:text-blue-600 font-medium"
            onClick={getRandomSourceContent}
            disabled={loading}
          >
            Get Random Source
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
          <p>An error occurred: {error}</p>
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