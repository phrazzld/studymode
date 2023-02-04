import { collection, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../pages/_app";
import { useStore } from "../store";
import { Source } from "../typings";

export const useSources = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userRefs } = useStore();

  // Fetch sources from Firestore
  const fetchSources = async () => {
    try {
      if (!userRefs) {
        return;
      }

      if (!userRefs.firebaseId) {
        return;
      }

      let ss: any[] = [];
      const sourcesQuery = query(
        collection(db, "users", userRefs.firebaseId, "sources")
      );
      const sourcesSnapshot = await getDocs(sourcesQuery);
      if (sourcesSnapshot.empty) {
        console.log("No sources found.");
      }
      sourcesSnapshot.forEach((snap: any) => {
        ss.push({ id: snap.id, ...snap.data() });
      });
      setSources(ss);
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [JSON.stringify(userRefs)]);

  return { sources, loading, error };
};
