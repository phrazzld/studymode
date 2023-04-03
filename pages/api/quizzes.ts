import { PROMPTS } from "@/prompts";
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const isValidOpenAiResponse = (response: any) => {
  if (response.status !== 200) {
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
  const { source } = req.body;

  try {
    let flagged = false;
    const moderationResponse = await openai.createModeration({
      input: source,
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

    const prompt = PROMPTS.GENERATE_QUIZ.replace("{INPUT}", source);

    const completionConfig: CreateChatCompletionRequest = {
      model: "gpt-3.5-turbo",
      max_tokens: 3000,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: PROMPTS.SYSTEM_INIT,
        },
        {
          role: "user",
          content: prompt,
        },
        {
          role: "assistant",
          content: "Sure! Here's the JSON:",
        },
      ],
    };
    const response = await openai.createChatCompletion(completionConfig);

    if (!isValidOpenAiResponse(response)) {
      res.status(500).json({ error: "Failed to generate quiz" });
      return;
    }

    const quizzes = JSON.parse(
      response.data.choices[0].message?.content.trim() || ""
    );

    res.status(200).json({ quizzes });
  } catch (err: any) {
    console.error("Error generating quiz");
    console.error(err);
    res.status(500).json({ error: "Failed to generate quiz" });
    return;
  }
};

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
