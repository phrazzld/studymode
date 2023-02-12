"use client";

import Link from "next/link";
import { auth } from "../pages/_app";
import { useStore } from "../store";

export default function Header() {
  const { userRefs } = useStore();

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <div className="flex justify-between items-center p-5 bg-blue-500">
      <Link href="/" className="text-2xl font-bold text-white">
        studymode
      </Link>
      <div>
        {userRefs?.loaded === false ? (
          <></>
        ) : userRefs?.firebaseId ? (
          <>
            <Link href="/quizzes/new" className="text-xl text-white p-5">
              Create
            </Link>
            <Link href="/sources" className="text-xl text-white p-5">
              Sources
            </Link>
            <Link href="/quizzes" className="text-xl text-white p-5">
              Quizzes
            </Link>
            <Link href="#" className="text-xl text-white p-5" onClick={signOut}>
              Sign Out
            </Link>
          </>
        ) : (
          <Link href="/auth" className="text-xl text-white p-5">
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
