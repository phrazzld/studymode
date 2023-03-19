"use client";

import { SAMPLE_SOURCE_CONTENT } from "@/constants/sampleSourceContent";
import { useCreateQuizzes } from "@/hooks/useCreateQuizzes";
import { useSmartCreateQuizzes } from "@/hooks/useSmartCreateQuizzes";
import Link from "next/link";
import { useState } from "react";
import { BsLightbulb } from "react-icons/bs";
import { GrTextAlignFull } from "react-icons/gr";

export default function CreateQuiz() {
  const [selectedOption, setSelectedOption] = useState<
    "classic" | "smart" | null
  >(null);

  const handleOptionClick = (option: "classic" | "smart"): void => {
    setSelectedOption(option);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <h1 className="text-4xl font-bold my-8">Create Quizzes</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-screen-lg my-8">
        <div
          className={`${
            selectedOption === "classic" ? "bg-blue-500 text-white" : "bg-white"
          } flex items-center justify-center flex-col p-8 rounded-lg shadow-lg cursor-pointer`}
          onClick={() => handleOptionClick("classic")}
        >
          <div className="flex flex-row items-center justify-center mb-4">
            <GrTextAlignFull className="text-3xl mr-3" />
            <h2 className="text-2xl font-bold">Classic</h2>
          </div>
          <p className="text-gray-700">
            Type or paste text, and we'll extract quizzes from it.
          </p>
        </div>
        <div
          className={`${
            selectedOption === "smart" ? "bg-blue-500 text-white" : "bg-white"
          } flex items-center justify-center flex-col p-8 rounded-lg shadow-lg cursor-pointer`}
          onClick={() => handleOptionClick("smart")}
        >
          <div className="flex flex-row items-center justify-center mb-4">
            <BsLightbulb className="text-3xl mr-3" />
            <h2 className="text-2xl font-bold">Smart</h2>
          </div>
          <p className="text-gray-700">
            Explain what you want to learn and we'll do the rest.
          </p>
        </div>
      </div>

      {!!selectedOption && (
        <div className="w-full max-w-screen-lg">
          {selectedOption === "classic" ? (
            <ClassicForm />
          ) : selectedOption === "smart" ? (
            <SmartForm />
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
}

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
    <div className="bg-white p-8 rounded-lg shadow-md">
      <textarea
        rows={10}
        className="resize-none w-full p-2 border border-gray-300 rounded-lg shadow-lg mb-4"
        placeholder="Enter your source content here to generate quizzes from it"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      <div className="flex justify-between items-center">
        <div>
          <button
            className={`bg-blue-500 text-white font-medium py-2 px-4 rounded-lg mr-4 ${
              loading ? "cursor-not-allowed opacity-50" : "hover:bg-blue-600"
            }`}
            onClick={handleCreateQuizzes}
            disabled={loading}
          >
            Generate Quizzes
          </button>
          <button
            className={`text-blue-500 font-medium ${
              loading ? "cursor-not-allowed opacity-50}" : "hover:text-blue-600"
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

function SmartForm() {
  const [prompt, setPrompt] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { smartCreateQuizzes, quizzes, loading, error } =
    useSmartCreateQuizzes(prompt);

  const handleCreateQuizzes = (): void => {
    if (prompt.length > 1000) {
      setValidationError("Prompt must be less than 1000 characters");
    } else {
      setValidationError("");
      smartCreateQuizzes();
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <textarea
        rows={2}
        className="resize-none w-full p-2 border border-gray-300 rounded-lg shadow-lg mb-4"
        placeholder="What would you like to learn?"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex justify-between items-center">
        <button
          className={`bg-blue-500 text-white font-medium py-2 px-4 rounded-lg ${
            loading ? "cursor-not-allowed opacity-50" : "hover:bg-blue-600"
          }`}
          onClick={handleCreateQuizzes}
          disabled={loading}
        >
          Generate Quizzes
        </button>
        <div
          className={`p-2 rounded-lg text-sm ${
            prompt.length > 1000
              ? "bg-red-100 text-red-500"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {prompt.length}/1000
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
