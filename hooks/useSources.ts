import { db } from "@/pages/_app";
import { useStore } from "@/store";
import { Source } from "@/typings";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDownloadURL, getStorage, listAll, ref } from "firebase/storage";
import { useEffect, useState } from "react";

export const useSources = () => {
  const storage = getStorage();
  const [sources, setSources] = useState<Source[]>([]);
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userRefs } = useStore();

  const fetchPDFs = async () => {
    try {
      if (!userRefs || !userRefs.firebaseId) {
        return;
      }

      const userPdfRef = ref(storage, `${userRefs.firebaseId}/`);
      const pdfList = await listAll(userPdfRef);
      const pdfPromises = pdfList.items.map((pdfItem) =>
        getDownloadURL(pdfItem)
      );
      const pdfURLs = await Promise.all(pdfPromises);
      console.log("pdfURLs", pdfURLs);
      setPdfs(pdfURLs);
    } catch (error: any) {
      setError(error);
    }
  };

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
      // Get sources from Firestore, ordered by createdAt
      const sourcesQuery = query(
        collection(db, "users", userRefs.firebaseId, "sources"),
        orderBy("createdAt", "desc")
      );
      const sourcesSnapshot = await getDocs(sourcesQuery);
      if (sourcesSnapshot.empty) {
        console.warn("No sources found.");
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
    fetchPDFs();
  }, [JSON.stringify(userRefs)]);

  return { sources, pdfs, loading, error };
};
