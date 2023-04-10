import { auth, db } from "@/pages/_app";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";

export const useCreateMemreUser = () => {
  const [memreId, setMemreId] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createMemreUser = async (): Promise<string | null> => {
    try {
      setError(null);
      setLoading(true);
      if (!auth.currentUser) {
        console.warn("No user logged in");
        return null;
      }

      const user = auth.currentUser;

      // Create user document if one does not already exist
      await getDoc(doc(db, "users", user.uid));

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firebaseId: user.uid }),
      });

      // If the response is not ok, throw an error
      if (!response.ok) {
        console.error(response);
        const errResponse = await response.json();
        console.error(errResponse);
        setError(errResponse.error.message);
        return null;
      }

      const { memreId } = await response.json();

      setMemreId(memreId || null);
      return memreId || null;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createMemreUser, memreId, loading, error };
};
