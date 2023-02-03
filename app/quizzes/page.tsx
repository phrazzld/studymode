import Link from "next/link";
import QuizzesList from "./QuizzesList";

export default function Quizzes() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-medium my-5">Quizzes</h1>

        <Link href="/quizzes/new">
          <button className="bg-blue-500 text-white rounded-md h-10 px-4">
            Create Quiz
          </button>
        </Link>
      </div>

      <QuizzesList />
    </div>
  );
}
