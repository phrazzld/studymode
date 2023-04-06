import { generateQuizzes } from "@/firebase";
import { auth, db } from "@/pages/_app";
import { useStore } from "@/store";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import { useEffect, useRef, useState } from "react";

GlobalWorkerOptions.workerSrc = "/pdf-worker.js";

const getSentences = (text: string): string[] => {
  return text.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [];
};

async function loadPdfjs() {
  if (typeof window === "undefined") {
    return null;
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
  const { getDocument } = pdfjs;
  return getDocument;
}

export async function extractTextFromPdf(file: any) {
  const getDocument = await loadPdfjs();

  if (!getDocument) {
    throw new Error("PDF.js is not available on the server-side.");
  }

  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const pdf = await getDocument({ data: arrayBuffer }).promise;

  let extractedText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    extractedText += content.items.map((item: any) => item.str).join(" ");
  }

  return extractedText;
}

export default function PDFUploadForm() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { userRefs } = useStore();
  /* const [title, setTitle] = useState(""); */
  /* const [objectives, setObjectives] = useState(""); */
  /**/
  /* const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => { */
  /*   setTitle(e.target.value); */
  /* }; */
  /**/
  /* const handleObjectivesChange = (e: React.ChangeEvent<HTMLInputElement>) => { */
  /*   setObjectives(e.target.value); */
  /* }; */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setUploadError(null);
    } else {
      setPdfFile(null);
      setUploadError("Invalid file type. Please select a PDF file.");
    }
  };

  const uploadToFirebase = async () => {
    if (!auth.currentUser) {
      console.warn("User is not logged in.");
      return;
    }

    let storageRef: any;

    if (pdfFile) {
      try {
        const id = Math.random().toString(36).substring(2);
        const storage = getStorage();
        const storageLocation = `${id}-${pdfFile.name}`;
        storageRef = ref(storage, `${auth.currentUser.uid}/${storageLocation}`);
        await uploadBytes(storageRef, pdfFile);
      } catch (error: any) {
        setUploadError(error.message);
      }
    }

    return storageRef;
  };

  const processChunk = async (chunk: string[], fileRef: any) => {
    if (!auth.currentUser) {
      console.warn("No user logged in.");
      return;
    }

    const user = auth.currentUser;

    // Perform your operations on the chunk of 1000 words here
    console.log("Processing chunk...");
    console.log(chunk.join(" "));

    // Format the text first, since the text extraction might be sloppy
    const formattingResponse = await fetch("/api/format", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: chunk.join(" "),
      }),
    });
    const formattedResponseJson = await formattingResponse.json();
    let formattedChunk = formattedResponseJson.formattedText;

    // Then append the PDF title and link
    if (fileRef) {
      const url = await getDownloadURL(fileRef);
      console.log("url:", url)
      formattedChunk = formattedChunk.concat(`\n\nSource PDF: ${url}`);
    }

    // Then generate a source from the chunk

    // Throw an error if userRefs or userRefs.memreId is null
    if (!userRefs?.memreId) {
      throw new Error("No Memre user id");
    }

    // Create user document if one does not already exist
    await getDoc(doc(db, "users", user.uid));

    // Save source to users/sources subcollection
    const sourceTitle = formattedChunk
      .split(" ")
      .slice(0, 5)
      .join(" ")
      .concat("...");
    const createdAt = new Date();
    const sourceDoc = await addDoc(
      collection(db, "users", user.uid, "sources"),
      {
        title: sourceTitle,
        text: formattedChunk,
        createdAt: createdAt,
      }
    );

    // Add source to Pinecone index
    await fetch("/api/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType: "source",
        data: {
          id: sourceDoc.id,
          title: sourceTitle,
          text: formattedChunk,
          createdAt: createdAt,
        },
        userId: user.uid,
      }),
    });

    // Create quizzes
    await generateQuizzes(formattedChunk, sourceDoc, userRefs.memreId);
  };

  const generateQuizzesFromPdf = async () => {
    try {
      if (!pdfFile) {
        console.warn("No file selected.");
        return;
      }

      const storageRef = await uploadToFirebase();
      const getDocument = await loadPdfjs();

      if (!getDocument) {
        throw new Error("PDF.js is not available on the server-side.");
      }

      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(pdfFile);
      });

      const pdf = await getDocument({ data: arrayBuffer }).promise;

      let buffer: string[] = [];

      // Iterate through the pages and process chunks as they become available
      for (let i = 1; i <= pdf.numPages; i++) {
        setUploadProgress(((i-1) / pdf.numPages) * 100);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        const pageSentences = getSentences(pageText);

        // Add pageSentences to the buffer
        buffer.push(...pageSentences);

        let chunkWordCount = 0;
        let chunkStartIndex = 0;

        for (let j = 0; j < buffer.length; j++) {
          const sentenceWordCount = buffer[j].split(/\s+/).length;
          chunkWordCount += sentenceWordCount;

          if (chunkWordCount > 500) {
            const chunk = buffer.slice(chunkStartIndex, j);
            await processChunk(chunk, storageRef);

            chunkStartIndex = j;
            chunkWordCount = sentenceWordCount;
          }
        }

        // Keep only unprocessed sentences in the buffer
        buffer = buffer.slice(chunkStartIndex);
      }

      // Process any remaining words in the buffer
      if (buffer.length > 0) {
        await processChunk(buffer, storageRef);
      }
      setUploadSuccess(true);
    } catch (error: any) {
      console.error(error);
      setUploadError(error.message);
    }
  };

  const handleCancel = () => {
    setUploadProgress(0);
    setPdfFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (uploadSuccess) {
      setUploadProgress(0);
      setPdfFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [uploadSuccess]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      {/* <div className="mb-4"> */}
      {/*   <label htmlFor="title" className="block mb-2"> */}
      {/*     Title */}
      {/*   </label> */}
      {/*   <input */}
      {/*     id="title" */}
      {/*     type="text" */}
      {/*     value={title} */}
      {/*     onChange={handleTitleChange} */}
      {/*     className="w-full p-2 border border-gray-300 rounded-lg" */}
      {/*   /> */}
      {/* </div> */}
      {/* <div className="mb-4"> */}
      {/*   <label htmlFor="learning-objectives" className="block mb-2"> */}
      {/*     Learning Objectives */}
      {/*   </label> */}
      {/*   <input */}
      {/*     id="learning-objectives" */}
      {/*     type="text" */}
      {/*     value={objectives} */}
      {/*     onChange={handleObjectivesChange} */}
      {/*     className="w-full p-2 border border-gray-300 rounded-lg" */}
      {/*   /> */}
      {/* </div> */}
      {pdfFile ? (
        <div className="flex items-center justify-between mb-4">
          <div className="truncate w-64">{pdfFile.name}</div>
          <button
            onClick={handleCancel}
            className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={generateQuizzesFromPdf}
          >
            Generate Quizzes
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="file"
          className="mb-4"
          accept="application/pdf"
          onChange={handleFileChange}
        />
      )}
      {uploadProgress > 0 && (
        <Box sx={{ width: "100%", py: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        <div className="mt-4 bg-gray-100 border border-gray-400 text-gray-700 p-4 rounded-lg">
          <p>Uploading your PDF and generating quizzes from it...</p>
          <p>This could take a while. Leave this page open. We'll let you know when it finishes.</p>
        </div>
        </Box>
      )}
      {uploadError && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
          <p>An error occurred: {uploadError}</p>
        </div>
      )}
      {uploadSuccess && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg">
          <p>Quizzes created!</p>
        </div>
      )}
    </div>
  );
}