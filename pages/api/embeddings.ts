import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { Source } from "@/typings";

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

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { contentType, data, userId } = req.body;
  try {
    switch (contentType) {
      case "source":
        await addSourceToIndex(data, userId);
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

// TODO: Error handling
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // switch case on req.method
  switch (req.method) {
    case "POST":
      return handlePost(req, res);
    default:
      res.status(405).json({ error: "Method Not Allowed" });
  }
}
