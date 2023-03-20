"use client";

import { useQuiz } from "@/hooks/useQuiz";
import { auth, db } from "@/pages/_app";
import { Answer } from "@/typings";
import { doc, setDoc } from "firebase/firestore";
import { Field, FieldArray, Form, Formik } from "formik";
import Link from "next/link";
import { useEffect } from "react";
import { Oval } from "react-loader-spinner";

type PageProps = {
  params: {
    quizId: string;
  };
};

export default function EditQuizPage({ params: { quizId } }: PageProps) {
  const { quiz, loading, error } = useQuiz(quizId);

  const initialValues = {
    question: quiz?.question || "",
    answers: quiz?.answers || [],
  };

  useEffect(() => {
    if (quiz) {
      initialValues.question = quiz.question;
      initialValues.answers = quiz.answers;
    }
  }, [JSON.stringify(quiz)]);

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      if (!auth.currentUser) {
        throw new Error("Cannot edit quiz. Not logged in.");
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      const quizRef = doc(userRef, "quizzes", quizId);
      await setDoc(
        quizRef,
        {
          question: values.question,
          answers: values.answers,
        },
        { merge: true }
      );

      // Redirect to the quiz page
      window.location.href = `/quizzes/${quizId}`;
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

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold my-4">Edit Quiz</h1>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values }) => (
          <Form className="w-full max-w-sm">
            <div className="flex flex-col mb-4">
              <label htmlFor="question" className="font-bold mb-2">
                Question:
              </label>
              <Field
                as="textarea"
                className="w-full h-32 border border-gray-400 p-2 mb-4"
                id="question"
                name="question"
              />
            </div>

            <FieldArray name="answers">
              {({ remove, push }) => (
                <>
                  {values.answers.map((answer: Answer, index: number) => (
                    <div key={index} className="flex flex-col mb-4">
                      <label
                        htmlFor={`answers.${index}.text`}
                        className="font-bold mb-2"
                      >
                        Answer {index + 1}:
                      </label>
                      <Field
                        className="border border-gray-400 p-2"
                        type="text"
                        id={`answers.${index}.text`}
                        name={`answers.${index}.text`}
                      />
                      <div className="flex items-center mb-2">
                        <Field
                          type="checkbox"
                          name={`answers.${index}.correct`}
                        />
                        <span className="ml-2">Correct</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 mb-2"
                      >
                        Remove Answer
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      push({
                        text: "",
                        correct: false,
                      })
                    }
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mb-4"
                  >
                    Add Answer
                  </button>
                </>
              )}
            </FieldArray>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2"
              >
                Save Changes
              </button>
              <Link href="/quizzes/[quizId]" as={`/quizzes/${quizId}`}>
                <button className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500">
                  Cancel
                </button>
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
