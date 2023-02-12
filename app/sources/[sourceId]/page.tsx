"use client";

import { deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { Oval } from "react-loader-spinner";
import { useSource } from "../../../hooks/useSource";
import { useSourceQuizzes } from "../../../hooks/useSourceQuizzes";
import { auth, db } from "../../../pages/_app";
import { useStore } from "../../../store";
import Study from "../../Study";

type PageProps = {
  params: {
    sourceId: string;
  };
};

export default function SourcePage({ params: { sourceId } }: PageProps) {
  const { source, loading, error } = useSource(sourceId);
  const {
    quizzes,
    loading: loadingQuizzes,
    error: errorQuizzes,
  } = useSourceQuizzes(sourceId);
  const { studyMode, setStudyMode } = useStore();

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
    return <div>{error}</div>;
  }

  if (!source) {
    return <div>Source not found</div>;
  }

  return (
    <div className="flex flex-col p-6">
      {studyMode ? (
        <Study quizzes={quizzes} />
      ) : (
        <>
          <h1 className="text-2xl font-medium mb-4">Source: {sourceId}</h1>
          <p className="text-lg font-light mb-4">{source.text}</p>

          <div className="flex justify-between">
            <button
              onClick={() => setStudyMode(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            >
              Study {quizzes.length} Quizzes
            </button>
            <div>
              <Link
                href="/sources/[sourceId]/edit"
                as={`/sources/${sourceId}/edit`}
              >
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
        </>
      )}
    </div>
  );
}
