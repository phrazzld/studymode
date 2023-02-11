import type { NextApiRequest, NextApiResponse } from "next";

const MEMRE_API_URL = "https://learning-engine.p.rapidapi.com/memre_api/v1";

const handlePost = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { firebaseId, memreItemId, memreUserId, quizResult } = req.body;

  if (!firebaseId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Make sure quizResult is either "Correct", "Incorrect", or "AlmostCorrect"
  if (!["Correct", "Incorrect", "AlmostCorrect"].includes(quizResult)) {
    res.status(400).json({ message: "Invalid quizResult" });
    return;
  }

  // TODO: Actually get study time millis
  const options = {
    method: "POST",
    url: `${MEMRE_API_URL}/study`,
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.MEMRE_API_KEY,
      "X-RapidAPI-Host": "learning-engine.p.rapidapi.com",
    },
    body: {
      item_id: memreItemId,
      user_id: memreUserId,
      quiz_result: quizResult,
      study_time_millis: 1
    }
  };

  try {
    // POST to /study with fetch
    const response = await fetch(options.url, {
      method: options.method,
      headers: options.headers,
      body: JSON.stringify(options.body)
    });

    const data = await response.json();

    if (data.error) {
      res.status(500).json({ message: data.error });
      return;
    }

    res.status(200).json({ message: "Study session created" });
  } catch (error: any) {
    res.status(500).json({ error });
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
      res.status(500).json({ error: "Method not supported" });
  }
}
