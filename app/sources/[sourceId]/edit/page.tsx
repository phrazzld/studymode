"use client";

import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSource } from "../../../../hooks/useSource";
import { auth, db } from "../../../../pages/_app";

type PageProps = {
  params: {
    sourceId: string;
  };
};

export default function EditSourcePage({ params: { sourceId } }: PageProps) {
  const { source, loading, error } = useSource(sourceId);
  const [text, setText] = useState("");

  useEffect(() => {
    if (source && !text) {
      setText(source.text);
    }
  }, [JSON.stringify(source)]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!auth.currentUser) {
        throw new Error("Cannot edit source. Not logged in.");
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      const sourceRef = doc(userRef, "sources", sourceId);
      await setDoc(sourceRef, { text });

      // Redirect to sources page
      window.location.href = "/sources";
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!source) {
    return <div>Source not found</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Edit Source Page: {sourceId}</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="flex flex-col mb-4">
          <label htmlFor="text" className="font-bold mb-2">
            Text:
          </label>
          <textarea
            className="w-full h-32 border border-gray-400 p-2 mb-4"
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="flex justify-between">
          <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Save Changes
          </button>
          <Link href="/sources/[sourceId]" as={`/sources/${sourceId}`}>
            <button className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500">
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
