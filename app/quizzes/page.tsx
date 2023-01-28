import React from 'react'
import QuizzesList from './QuizzesList'
import CreateQuiz from './CreateQuiz'

export default function Quizzes() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-medium">Quizzes</h1>
      <CreateQuiz />
      <QuizzesList />
    </div>
  )
}
