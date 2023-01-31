"use client";

import { useState } from "react";
import { useCreateQuizzes } from "../../hooks/useCreateQuizzes";

// TODO: Better error handling and UX
export default function CreateQuiz() {
  const [source, setSource] = useState("");
  const { createQuizzes, loading } = useCreateQuizzes(source);

  return (
    <div className="flex flex-col space-y-4">
      <label className="flex flex-col">
        <span className="text-sm font-medium">Source Content</span>
        <textarea
          rows={5}
          cols={30}
          className="border border-gray-300 rounded-md p-2 w-full"
          placeholder="Source Content"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </label>
      <button
        className={`bg-blue-500 text-white rounded-md p-2 py-1 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={createQuizzes}
        disabled={loading}
      >
        Generate Quizzes
      </button>
    </div>
  );
}
