// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { PROMPTS } from "../../prompts";

const QUIZ_GENERATOR_CONFIG = {
  model: "text-davinci-003",
  max_tokens: 2000,
  temperature: 0.4,
};

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
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { source } = req.body;

  const prompt = PROMPTS.GENERATE_QUIZ.replace("{INPUT}", source);

  // TODO: Hit the moderation endpoint

  const completionConfig = {
    ...QUIZ_GENERATOR_CONFIG,
    prompt,
  };
  const response = await openai.createCompletion(completionConfig);

  if (!isValidOpenAiResponse(response)) {
    res.status(500).json({ error: "Failed to generate quiz" });
  }

  const quizzes = JSON.parse(response.data.choices[0].text || "");

  res.status(200).json({ quizzes });
}

// TODO: Error handling
// TODO: Handle CRUD
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // switch case on req.method
  switch (req.method) {
    case "POST":
      return handlePost(req, res);
    default:
      res.status(500).json({ error: "Method not supported" });
  }
}
