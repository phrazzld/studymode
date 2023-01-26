import Link from "next/link";
import { auth } from "../pages/_app";

export default function Header() {
  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <div className="flex justify-between p-5 bg-blue-500">
      <Link href="/" className="text-2xl font-bold text-white">
        studymode
      </Link>
      <div>
        <Link href="/quizzes" className="text-xl text-white p-5">
          Quizzes
        </Link>
        <Link href="/study" className="text-xl text-white p-5">
          Study
        </Link>

        {auth.currentUser ? (
          <Link href="#" className="text-xl text-white p-5" onClick={signOut}>
            Sign Out
          </Link>
        ) : (
          <Link href="/auth" className="text-xl text-white p-5">
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
