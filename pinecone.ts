import { PineconeClient } from "@pinecone-database/pinecone";
import { Configuration, OpenAIApi } from "openai";
import { auth } from "./pages/_app";
import { Source } from "./typings";

export const PINECONE_INDEX_NAME = "studymode";

const openAIConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(openAIConfig);

export const initPinecone = async () => {
  console.debug("Initializing Pinecone...");
  console.debug("environment:", process.env.NODE_ENV || "development")
  console.debug("apiKey:", process.env.PINECONE_API_KEY || "")
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.NODE_ENV || "development",
    apiKey: process.env.PINECONE_API_KEY || "",
  });
  console.debug("pinecone:", pinecone)

  return pinecone;
};

export const addSourceToIndex = async (source: Source) => {
  try {
    // Can't add a source to the index if there's no user logged in
    if (!auth.currentUser) {
      console.error("No user logged in");
      throw new Error("No user logged in");
    }
    const user = auth.currentUser;

    // Initialize Pinecone and get the index
    console.debug("Initializing Pinecone...");
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
            userId: user.uid,
            sourceId: source.id,
          },
        },
      ],
      namespace: user.uid,
    };
    const response = await index.upsert({ upsertRequest });
    console.debug("Source added to index.");
    console.debug("response:", response)
    return response;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
