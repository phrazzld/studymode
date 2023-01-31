"use client";

import React from 'react'
import { useSource } from "../../../hooks/useSource";
import Link from "next/link";
import { Answer } from "../../../typings";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../../pages/_app";

type PageProps = {
  params: {
    sourceId: string;
  };
};

export default function SourcePage({ params: { sourceId } }: PageProps) {
  const { source, loading, error } = useSource(sourceId);

  const deleteSource = async () => {
    // TODO: Prompt for confirmation

    try {
      if (!auth.currentUser) {
        throw new Error("Cannot delete source. Not logged in.");
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      const sourceRef = doc(userRef, "sources", sourceId);
      await deleteDoc(sourceRef);

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
    <div className="flex flex-col p-6">
      <h1 className="text-2xl font-medium mb-4">Source Page: {sourceId}</h1>
      <p className="text-lg font-light mb-4">{source.text}</p>

      <div className="flex">
        <Link href="/sources/[sourceId]/edit" as={`/sources/${sourceId}/edit`}>
          <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4">
            Edit
          </button>
        </Link>
        <button
          onClick={deleteSource}
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
