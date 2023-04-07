import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { Source, Quiz } from "@/typings";

const PINECONE_INDEX_NAME = "studymode";

const openAIConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(openAIConfig);

const initPinecone = async () => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: "us-west4-gcp",
    apiKey: process.env.PINECONE_API_KEY || "",
  });

  return pinecone;
};

const addQuizToIndex = async (quiz: Quiz, userId: string) => {
  try {
    // Initialize Pinecone and get the index
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    // Create an embedding for the source
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: `${quiz.question} ${quiz.answers.join(" ")}}`,
    });
    const embedding = embeddingResponse.data.data[0].embedding;

    // Add the source to the index
    const upsertRequest = {
      vectors: [
        {
          id: quiz.id,
          values: embedding,
          metadata: {
            userId: userId,
            type: "quiz",
            contentId: quiz.id,
            title: quiz.question,
            createdAt: quiz.createdAt,
          },
        },
      ],
      namespace: userId,
    };
    const response = await index.upsert({ upsertRequest });
    return response;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

const addSourceToIndex = async (source: Source, userId: string) => {
  try {
    // Initialize Pinecone and get the index
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    // Create an embedding for the source
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: `${source.title} ${source.text}`,
    });
    const embedding = embeddingResponse.data.data[0].embedding;

    // Add the source to the index
    const upsertRequest = {
      vectors: [
        {
          id: source.id,
          values: embedding,
          metadata: {
            userId: userId,
            type: "source",
            contentId: source.id,
            title: source.title,
            createdAt: source.createdAt,
          },
        },
      ],
      namespace: userId,
    };
    const response = await index.upsert({ upsertRequest });
    return response;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

type AddPdfChunkToIndexParams = {
  chunk: string;
  userId: string;
}

const addPdfChunkToIndex = async (params: AddPdfChunkToIndexParams) => {
  try {
    console.log("STUB")
  } catch (error: any) {
    console.error(error)
  }
}

const deleteFromIndex = async (id: string, userId: string) => {
  try {
    // Initialize Pinecone and get the index
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    // Delete the source from the index
    const response = await index.delete1({
      ids: [id],
      namespace: userId,
    });
    return response;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

// Query Pinecone for similar documents based on query
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, userId } = req.query;
  try {
    if (!query || !userId) return res.status(400).json({ error: "Invalid query" })
    if (Array.isArray(query) || Array.isArray(userId)) return res.status(400).json({ error: "Invalid query" })
    // Initialize Pinecone and get the index
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    // Create an embedding for the query
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: query || "",
    });
    const embedding = embeddingResponse.data.data[0].embedding;

    // Query the index for similar documents
    const response = await index.query({
      queryRequest: {
        namespace: userId,
        topK: 10,
        includeValues: true,
        includeMetadata: true,
        vector: embedding
      }
    });
    res.status(200).json(response);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { contentType, data, userId } = req.body;
  try {
    switch (contentType) {
      case "source":
        await addSourceToIndex(data, userId);
        res.status(200).json({ message: "Success" });
        break;
      case "quiz":
        await addQuizToIndex(data, userId);
        res.status(200).json({ message: "Success" });
        break;
      case "chunk":
        await addPdfChunkToIndex({ chunk: data, userId });
        res.status(200).json({ message: "Success" });
        break;
      default:
        res.status(400).json({ error: "Invalid content type" });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, userId } = req.body;
  try {
    await deleteFromIndex(id, userId);
    res.status(204).json({ message: "Success" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // switch case on req.method
  switch (req.method) {
    case "GET":
      return handleGet(req, res)
    case "POST":
      return handlePost(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      res.status(405).json({ error: "Method Not Allowed" });
  }
}
