import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { Source } from "../../typings";

const PINECONE_INDEX_NAME = "studymode";

const openAIConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(openAIConfig);

const initPinecone = async () => {
  console.debug("Initializing Pinecone...");
  console.debug("environment:", process.env.NODE_ENV || "development");
  console.debug("apiKey:", process.env.PINECONE_API_KEY || "");

  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.NODE_ENV || "development",
    apiKey: process.env.PINECONE_API_KEY || "",
  });
  console.debug("pinecone:", pinecone);

  return pinecone;
};

const addSourceToIndex = async (source: Source, userId: string) => {
  try {
    // Initialize Pinecone and get the index
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    console.debug("Pinecone initialized.");

    // Create an embedding for the source
    console.debug("Creating embedding for source...");
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: `${source.title} ${source.text}`,
    });
    const embedding = embeddingResponse.data.data[0].embedding;
    console.debug("Embedding created.");

    // Add the source to the index
    console.debug("Adding source to index...");
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
    console.debug("Source added to index.");
    console.debug("response:", response);
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { contentType, source, userId } = req.body;
  try {
    switch (contentType) {
      case "source":
        await addSourceToIndex(source, userId);
        res.status(200)
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
