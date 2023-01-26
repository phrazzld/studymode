"use client";

import "../styles/globals.css";
import Header from "./Header";
import { auth } from "../pages/_app";
import React, { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        console.log("onAuthStateChanged::user:", user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  console.log("RootLayout::user:", user);

  return (
    <html>
      <head />
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
