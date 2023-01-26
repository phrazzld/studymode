"use client";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { auth } from "../../pages/_app";
import { useRouter } from 'next/navigation'

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter()

  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/")
    } catch (error: any) {
      setError(error.message);
    }
  };

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/")
    } catch (error: any) {
      setError(error.message);
    }
  };

  const resetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-medium">Auth</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        className="bg-gray-200 p-2 rounded-md w-full"
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="bg-gray-200 p-2 rounded-md w-full mt-4"
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded-md mt-4"
        onClick={signUp}
      >
        Sign Up
      </button>
      <button
        className="bg-blue-500 text-white p-2 rounded-md mt-4"
        onClick={signIn}
      >
        Sign In
      </button>
      <button
        className="bg-blue-500 text-white p-2 rounded-md mt-4"
        onClick={resetPassword}
      >
        Reset Password
      </button>
    </div>
  );

  /* return ( */
  /*   <div> */
  /*     <h1>Auth</h1> */
  /*     {error && <p>{error}</p>} */
  /*     <input */
  /*       type="email" */
  /*       placeholder="email" */
  /*       value={email} */
  /*       onChange={(e) => setEmail(e.target.value)} */
  /*     /> */
  /*     <input */
  /*       type="password" */
  /*       placeholder="password" */
  /*       value={password} */
  /*       onChange={(e) => setPassword(e.target.value)} */
  /*     /> */
  /*     <button onClick={signUp}>Sign Up</button> */
  /*     <button onClick={signIn}>Sign In</button> */
  /*     <button onClick={resetPassword}>Reset Password</button> */
  /*   </div> */
  /* ); */
}
