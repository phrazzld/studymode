import type { NextApiRequest, NextApiResponse } from "next";

const MEMRE_API_URL = "https://learning-engine.p.rapidapi.com/memre_api/v1";

const handlePost = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { firebaseId, memreUserId } = req.body;

  if (!firebaseId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const options = {
    method: "POST",
    url: `${MEMRE_API_URL}/items`,
    headers: {
      "X-RapidAPI-Key": process.env.MEMRE_API_KEY,
      "X-RapidAPI-Host": "learning-engine.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(options.url, {
      method: options.method,
      headers: options.headers as HeadersInit,
    });

    const data = await response.json();

    if (data.error) {
      res.status(500).json({ message: data.error });
      return;
    }

    if (!data.data.id) {
      res.status(500).json({ message: "No item id returned" });
      return;
    }

    const memreId = data.data.id;

    // HACK: Create stub study session
    // This is because the Learning Engine API has no association between the user and the item otherwise
    // NOTE: This still doesn't make the new quizzes immediately recommended for study, which is ... not great
    const studySessionOptions = {
      method: "POST",
      url: `${MEMRE_API_URL}/study`,
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.MEMRE_API_KEY,
        "X-RapidAPI-Host": "learning-engine.p.rapidapi.com",
      },
      body: {
        item_id: memreId,
        user_id: memreUserId,
        quiz_result: 'Incorrect',
        study_time_millis: 1
      }
    }

    const studySessionResponse = await fetch(studySessionOptions.url, {
      method: studySessionOptions.method,
      headers: studySessionOptions.headers as HeadersInit,
      body: JSON.stringify(studySessionOptions.body)
    });

    if (!studySessionResponse.ok) {
      console.warn("Study session creation failed");
    }

    res.status(200).json({ message: "Item created", memreId: memreId });
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
      res.status(405).json({ error: "Method Not Allowed" });
  }
}
