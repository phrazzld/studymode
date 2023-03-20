"use client";

import { useQuiz } from "@/hooks/useQuiz";
import { auth, db } from "@/pages/_app";
import { Answer } from "@/typings";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
          <Form className="w-full max-w-lg">
            <div className="mb-6">
              <label htmlFor="question" className="block font-bold mb-2">
                Question:
              </label>
              <Field
                as="textarea"
                className="w-full h-32 border border-gray-400 p-3"
                id="question"
                name="question"
              />
            </div>

            <FieldArray name="answers">
              {({ remove, push }) => (
                <>
                  {values.answers.map((_answer: Answer, index: number) => (
                    <div key={index} className="mb-4">
                      <label
                        htmlFor={`answers.${index}.text`}
                        className="block font-bold mb-2"
                      >
                        Answer {index + 1}:
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <Field
                          className="border border-gray-400 p-2 flex-grow"
                          type="text"
                          id={`answers.${index}.text`}
                          name={`answers.${index}.text`}
                        />
                        <Field
                          type="checkbox"
                          name={`answers.${index}.correct`}
                          className="form-checkbox text-blue-500 h-5 w-5"
                        />
                        <span>Correct</span>
                      </div>
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
                    className="text-green-500 hover:text-green-600 mb-4"
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add Answer
                  </button>
                </>
              )}
            </FieldArray>

            <div className="flex justify-end space-x-2">
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
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
