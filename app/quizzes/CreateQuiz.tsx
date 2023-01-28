"use client";

import { useState } from "react";
import { useCreateQuizzes } from "../../hooks/useCreateQuizzes";

// TODO: Better error handling and UX
export default function CreateQuiz() {
  const [source, setSource] = useState("");
  const createQuizzes = useCreateQuizzes(source);

  // Return a form with a text input and a submit button
  return (
    <div className="flex flex-col space-y-4">
      <label className="flex flex-col">
        <span className="text-sm font-medium">Source Content</span>
        <textarea
          rows={5}
          cols={30}
          className="border border-gray-300 rounded-md p-2"
          placeholder="Source Content"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </label>
      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={createQuizzes}
      >
        Generate Quizzes
      </button>
    </div>
  );
}
