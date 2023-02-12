"use client";

import Link from "next/link";
import { Oval } from "react-loader-spinner";
import { useSources } from "../../hooks/useSources";
import { Source } from "../../typings";

export default function Sources() {
  const { sources, loading, error } = useSources();

  // TODO: Figure out how to fix issue where loading can be false
  // but sources.length is briefly 0
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Oval
          height={80}
          width={80}
          color="rgb(59 130 246)"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
          ariaLabel="oval-loading"
          secondaryColor="rgb(59 130 246)"
          strokeWidth={2}
          strokeWidthSecondary={2}
        />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="px-4 py-4">
      <h2 className="text-2xl font-medium mb-4">Sources</h2>

      {sources.length === 0 ? (
        <div>
          <p className="text-lg font-medium text-gray-600 mb-5">
            No sources found
          </p>
          <Link href="/quizzes/new">
            <button className="btn bg-blue-500 text-white py-4 px-4 rounded">
              Get Started
            </button>
          </Link>
        </div>
      ) : (
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
      )}
    </div>
  );
}
