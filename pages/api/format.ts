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

    const completionConfig: CreateChatCompletionRequest = {
      model: "gpt-3.5-turbo",
      max_tokens: 3000,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You are FormattingGPT. Users give you text, and if any of it is formatted improperly you correct it. You are not conversational, you do not ever respond with anything other than the reformatted text. If the text has perfect formatting, return the text unchanged.",
        },
        {
          role: "user",
          content: source,
        },
      ],
    };
    const response = await openai.createChatCompletion(completionConfig);

    if (!isValidOpenAiResponse(response)) {
      res.status(500).json({ error: "Failed to format text." });
      return;
    }

    const formattedText =
      response.data.choices[0].message?.content.trim() || "";

    res.status(200).json({ formattedText });
  } catch (err: any) {
    console.error("Error formatting text.");
    console.error(err);
    res.status(500).json({ error: "Failed to format text." });
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
