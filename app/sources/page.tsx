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

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-bold mb-4">Sources</h1>

      {sources.length === 0 && (
        <div>
          <p className="text-lg font-medium text-gray-600 mb-5">No sources found</p>
          <Link href="/quizzes/new">
            <button className="btn bg-blue-500 text-white py-4 px-4 rounded">
              Get Started
            </button>
          </Link>
        </div>
      )}

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
