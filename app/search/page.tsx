"use client";

// pages/search.tsx
import { useStore } from "@/store";
import { formatDate } from "@/utils";
import {
  faBookOpen,
  faList,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";
import { Oval } from "react-loader-spinner";

export default function Search() {
  const { userRefs } = useStore();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const performSearch = async () => {
    try {
      setLoading(true);
      if (!userRefs?.firebaseId) return;

      const query = new URLSearchParams({
        query: searchText,
        userId: userRefs.firebaseId,
      });
      const response = await fetch(`/api/embeddings?${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      const matches = data.matches.map((d: any) => ({
        id: d.id,
        score: d.score,
        contentType: d.metadata.type,
        title: d.metadata.title,
        createdAt: d.metadata.createdAt,
      }));
      setResults(matches);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  return (
    <div className="p-4">
      <div className="w-full mb-8">
        <div className="flex items-center border-b border-gray-300">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full py-2 pl-4 pr-10 text-xl outline-none focus:border-blue-500"
          />
          <button
            onClick={performSearch}
            className="p-2 text-blue-500 text-xl focus:outline-none bg-white"
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center mt-10">
          <Oval
            height={40}
            width={40}
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
      ) : (
        <ul className="mt-4 space-y-4">
          {results.map((result) => renderResult(result))}
        </ul>
      )}
    </div>
  );
}

type PineconeResult = {
  id: string;
  score: number;
  contentType: "source" | "quiz";
  title: string;
  createdAt: Date;
};

const renderResult = (result: PineconeResult) => {
  const { id, contentType, title, createdAt } = result;

  return (
    <li
      key={id}
      className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200"
    >
      <Link href={`/${contentType === "source" ? "sources" : "quizzes"}/${id}`}>
        <div className="flex items-center justify-between">
          <p className="text-blue-500 font-medium text-lg hover:underline mb-2">
            {title}
          </p>
          <p className="text-sm text-gray-400">
            {contentType === "source" ? (
              <FontAwesomeIcon icon={faBookOpen} />
            ) : (
              <FontAwesomeIcon icon={faList} />
            )}
          </p>
        </div>
        <div className="flex items-center mt-2">
          <p className="text-sm text-gray-400">{formatDate(createdAt)}</p>
        </div>
      </Link>
    </li>
  );
};
