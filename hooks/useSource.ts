import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../pages/_app";
import { useStore } from "../store";
import { Source } from "../typings";

export const useSource = (sourceId: string) => {
  const [source, setSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useStore();

  // Fetch sources from Firestore
  const fetchSource = async () => {
    try {
      if (!userId) {
        return;
      }

      const sourceRef = doc(db, "users", userId, "sources", sourceId);
      const sourceSnapshot = await getDoc(sourceRef);
      if (!sourceSnapshot.exists()) {
        console.log("No source found.");
        setSource(null);
        return;
      }
      const sourceData = sourceSnapshot.data();
      setSource(sourceData as Source);
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSource();
  }, [userId]);

  return { source, loading, error };
};
