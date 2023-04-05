import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import { useEffect, useRef, useState } from "react";

GlobalWorkerOptions.workerSrc = "/pdf-worker.js";

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

  const handleUpload = async () => {
    if (pdfFile) {
      try {
        const extractedText = await extractTextFromPdf(pdfFile);

        const storage = getStorage();
        const storageRef = ref(storage, pdfFile.name);
        await uploadBytes(storageRef, pdfFile);
        setUploadSuccess(true);
      } catch (error: any) {
        setUploadError(error.message);
      }
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
      <input
        ref={inputRef}
        type="file"
        className="mb-4"
        accept="application/pdf"
        onChange={handleFileChange}
      />
      {pdfFile && (
        <div className="flex items-center justify-between mb-4">
          <div className="truncate w-64">{pdfFile.name}</div>
          <button
            className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={handleUpload}
          >
            Upload PDF
          </button>
        </div>
      )}
      {uploadProgress > 0 && (
        <Box sx={{ width: "100%", py: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}
      {uploadError && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
          <p>An error occurred: {uploadError}</p>
        </div>
      )}
      {uploadSuccess && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg">
          <p>PDF successfully uploaded! We're processing your quizzes.</p>
        </div>
      )}
    </div>
  );
}
