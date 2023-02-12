"use client";

import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect } from "react";
import { useCreateMemreUser } from "../hooks/useCreateMemreUser";
import { auth, db } from "../pages/_app";
import { useStore } from "../store";
import "../styles/globals.css";
import Header from "./Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userRefs, setUserRefs } = useStore();
  const { createMemreUser } = useCreateMemreUser();

  useEffect(() => {
    const handleAuthStateChange = (user: any) => {
      if (!user) {
        setUserRefs(null);
        return;
      }

      const getUserDoc = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          if (userDoc.data()?.memreId) {
            setUserRefs({
              firebaseId: user.uid,
              memreId: userDoc.data()?.memreId,
            });
          } else {
            const memreId = await createMemreUser();
            setUserRefs({
              firebaseId: user.uid,
              memreId: memreId,
            });
            setDoc(
              doc(db, "users", user.uid),
              { memreId: memreId },
              { merge: true }
            );
          }
        } else {
          const memreId = await createMemreUser();
          setUserRefs({
            firebaseId: user.uid,
            memreId: memreId,
          });
          setDoc(
            doc(db, "users", user.uid),
            { memreId: memreId },
            { merge: true }
          );
        }
      };

      getUserDoc();
    };

    const unsubscribe = auth.onAuthStateChanged(handleAuthStateChange);

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
