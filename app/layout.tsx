"use client";

import Header from "@/app/Header";
import { useCreateMemreUser } from "@/hooks/useCreateMemreUser";
import { auth, db } from "@/pages/_app";
import { useStore } from "@/store";
import "@/styles/globals.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUserRefs } = useStore();
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
              loaded: true,
            });
          } else {
            const memreId = await createMemreUser();
            setUserRefs({
              firebaseId: user.uid,
              memreId: memreId || null,
              loaded: true,
            });
            setDoc(
              doc(db, "users", user.uid),
              { memreId: memreId || null },
              { merge: true }
            );
          }
        } else {
          const memreId = await createMemreUser();
          setUserRefs({
            firebaseId: user.uid,
            memreId: memreId || null,
            loaded: true,
          });
          setDoc(
            doc(db, "users", user.uid),
            { memreId: memreId || null },
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
      <body className="bg-gray-100">
        <Header />
        <div className="max-w-screen-sm mx-auto">{children}</div>
      </body>
    </html>
  );
}
