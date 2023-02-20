// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { PROMPTS } from "../../prompts";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const isValidOpenAiResponse = (response: any) => {
  if (response.status !== 200) {
    return false;
  }
  if (!response.data.choices[0]) {
    return false;
  }
  if (!response.data.choices[0].text) {
    return false;
  }
  return true;
};

type ModerationCategories = {
  "sexual/minors": boolean;
  sexual: boolean;
  hate: boolean;
  violence: boolean;
  "self-harm": boolean;
  "hate/threatening": boolean;
  "violence/graphic": boolean;
};

// Write a user-friendly error message based on the moderation categories
// that were flagged
const writeModerationError = (categories: ModerationCategories): string => {
  let error = "Your input was flagged for the following reasons: ";
  Object.keys(categories).forEach((category: string) => {
    if (
      categories.hasOwnProperty(category) &&
      categories[category as keyof ModerationCategories]
    ) {
      error += category + ", ";
    }
  });

  // Clean up string
  // Remove trailing comma
  error = error.slice(0, -2);

  return error;
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { input } = req.body;

  // Run input through moderation endpoint
  let flagged = false;
  const moderationResponse = await openai.createModeration({
    input,
  });
  if (moderationResponse.data.results[0].flagged) {
    console.warn("User input failed moderation check");
    flagged = true;
  }

  // Return an error if the input is flagged
  if (flagged) {
    res.status(400).json({
      error: writeModerationError(
        moderationResponse.data.results[0].categories
      ),
    });
    return;
  }

  // If we're making smart quizzes, create a source from the prompt first
  const openaiConfig = {
    model: "text-davinci-003",
    max_tokens: 1500,
    temperature: 0.6,
    prompt: PROMPTS.CREATE_SOURCE.replace("{INPUT}", input),
  };
  const response = await openai.createCompletion(openaiConfig);

  if (!isValidOpenAiResponse(response)) {
    res.status(500).json({ error: "Failed to generate source" });
    return;
  }

  const source = response.data.choices[0].text

  res.status(200).json({ source });
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
