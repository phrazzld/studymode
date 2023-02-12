import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "../pages/_app";

export const useCreateMemreUser = () => {
  const [memreId, setMemreId] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createMemreUser = async (): Promise<string | null> => {
    try {
      setError(null);
      setLoading(true);
      if (!auth.currentUser) {
        console.log("No user logged in");
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
        const errResponse = await response.json();
        setError(errResponse.error);
        return null;
      }

      const { memreId } = await response.json();

      setMemreId(memreId);
      return memreId
    } catch (err: any) {
      console.error(err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createMemreUser, memreId, loading, error };
};
