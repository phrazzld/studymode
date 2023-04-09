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
  const { title, objectives } = req.body;

  try {
    let flagged = false;
    const moderationResponse = await openai.createModeration({
      input: `${title} - ${objectives}`,
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

    const prompt = PROMPTS.GENERATE_LESSON_PLAN.replace(
      "{INPUT}",
      title + " - " + objectives
    );

    const completionConfig: CreateChatCompletionRequest = {
      model: "gpt-3.5-turbo",
      max_tokens: 2500,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: PROMPTS.LESSON_PLAN_GEN_SYS_INIT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };
    const response = await openai.createChatCompletion(completionConfig);

    if (!isValidOpenAiResponse(response)) {
      res.status(500).json({ error: "Failed to generate lesson plan" });
      return;
    }

    const lessonPlan = JSON.parse(
      response.data.choices[0].message?.content.trim() || ""
    );

    res.status(200).json({ lessonPlan });
  } catch (err: any) {
    console.error("Error generating lesson plan");
    console.error(err);
    res.status(500).json({ error: "Failed to generate lesson plan" });
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
