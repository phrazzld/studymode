"use client";

import Link from "next/link";
import { auth } from "../pages/_app";
import { useStore } from "../store";

export default function Header() {
  const { userId } = useStore();

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <div className="flex justify-between p-5 bg-blue-500">
      <Link href="/" className="text-2xl font-bold text-white">
        studymode
      </Link>
      <div>
        {!!userId ? (
          <>
            <Link href="/sources" className="text-xl text-white p-5">
              Sources
            </Link>
            <Link href="/quizzes" className="text-xl text-white p-5">
              Quizzes
            </Link>
            <Link href="/study" className="text-xl text-white p-5">
              Study
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
