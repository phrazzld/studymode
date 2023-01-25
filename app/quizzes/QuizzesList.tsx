import Link from "next/link";
import { Quiz } from "../../typings";

/* const fetchQuizzes = async () => { */
/*   const res = await fetch('http://localhost:3000/api/quizzes') */
/*   const quizzes: Quiz[] = await res.json() */
/*   return quizzes */
/* } */

/* export default async function QuizzesList() { */
/*   const quizzes = await fetchQuizzes() */
export default function QuizzesList() {
  const quizzes: Quiz[] = [
    {
      id: 1,
      question: "What is 1 + 1?",
      answers: [
        {
          text: "2",
          correct: true,
        },
        {
          text: "3",
          correct: false,
        },
        {
          text: "7",
          correct: false,
        },
        {
          text: "banana",
          correct: false,
        },
      ],
    },
  ];

  return (
    <div>
      {quizzes.map((quiz) => (
        <p key={quiz.id}>
          <Link href={`/quizzes/${quiz.id}`}>Quiz: {quiz.question}</Link>
        </p>
      ))}
    </div>
  );
}
