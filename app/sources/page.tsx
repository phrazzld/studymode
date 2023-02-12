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
      <h2 className="text-2xl font-medium mb-4">Sources</h2>
      <ul className="space-y-4">
        {sources.map((source: Source) => (
          <li key={source.id} className="flex items-center">
            <Link
              href={`/sources/${source.id}`}
              className="text-blue-500 font-medium hover:underline"
            >
              <h3 className="text-lg font-medium">{source.id}</h3>
              <p className="text-sm text-gray-700">
                {source.text.substring(0, 200)}...
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
