"use client";

import React from "react";
import Link from "next/link";
import { useSources } from "../../hooks/useSources";

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
      <ul className="space-y-4">
        {sources.map((source) => (
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
