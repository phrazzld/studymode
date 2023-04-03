"use client";

import { auth } from "@/pages/_app";
import { useStore } from "@/store";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setUserRefs } = useStore();

  const signUp = async () => {
    try {
      const firebaseUserCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseId = firebaseUserCredentials.user.uid;
      const createMemreUserResponse = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseId,
        }),
      });
      const createMemreUserResponseJson = await createMemreUserResponse.json();
      const memreId = createMemreUserResponseJson.memreId;
      setUserRefs({
        firebaseId,
        memreId,
        loaded: true,
      });
      router.push("/");
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
  };

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
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

  // If user is signed in, redirect to home page
  if (auth.currentUser) {
    console.warn("User is already signed in");
    router.push("/");
  }

  return (
    <div className="flex flex-col items-center py-8">
      {error && <p className="text-red-500">{error}</p>}
      <input
        className="bg-gray-200 p-4 rounded-md w-full mt-8"
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="bg-gray-200 p-4 rounded-md w-full mt-8"
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex mt-4">
        <button
          className="bg-blue-500 text-white py-4 px-8 rounded-md mt-8 m-5"
          onClick={signUp}
        >
          Sign Up
        </button>
        <button
          className="bg-white text-blue-500 py-4 px-8 rounded-md mt-8 border border-blue-500 m-5"
          onClick={signIn}
        >
          Sign In
        </button>
      </div>
      <p className="text-gray-500 mt-8">
        Forgot password?
        <span
          className="underline cursor-pointer text-blue-500 px-4"
          onClick={resetPassword}
        >
          Reset password
        </span>
      </p>
    </div>
  );
}
