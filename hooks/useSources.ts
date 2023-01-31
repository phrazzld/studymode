import { collection, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../pages/_app";
import { useStore } from "../store";

export const useSources = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { userId } = useStore();

  // Fetch sources from Firestore
  const fetchSources = async () => {
    try {
      if (!userId) {
        return;
      }
      let ss: any[] = [];
      const sourcesQuery = query(collection(db, "users", userId, "sources"));
      const sourcesSnapshot = await getDocs(sourcesQuery);
      if (sourcesSnapshot.empty) {
        console.log("No sources found.");
      }
      sourcesSnapshot.forEach((snap: any) => {
        ss.push({ id: snap.id, ...snap.data() });
      });
      setSources(ss);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [userId]);

  return { sources, loading, error };
};
