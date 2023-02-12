"use client";

import Link from "next/link";
import { useSources } from "../../hooks/useSources";
import { Source } from "../../typings";

export default function Sources() {
  const { sources, loading, error } = useSources();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // TODO: Have like any style at all
  // TODO: Enable studying all quizzes for a particular source
  return (
    <div className="px-4 py-4">
      <ul className="space-y-4">
        {sources.map((source: Source) => (
          <li key={source.id} className="flex items-center">
            <Link
              href={`/sources/${source.id}`}
              className="text-blue-500 font-medium"
            >
              {source.id}: {source.text.substring(0, 200)}...
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
