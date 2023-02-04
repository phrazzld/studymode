"use client";

import React, { useEffect } from "react";
import { auth } from "../pages/_app";
import { useStore } from "../store";
import "../styles/globals.css";
import Header from "./Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userRefs, setUserRefs } = useStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // TODO: Get /api/users/:id and set it to userRefs.memreId
        setUserRefs({
          firebaseId: user.uid,
          memreId: userRefs?.memreId || null,
        });
      } else {
        setUserRefs(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <html>
      <head />
      <body>
        <Header />
        <div className="max-w-screen-sm mx-auto">{children}</div>
      </body>
    </html>
  );
}
