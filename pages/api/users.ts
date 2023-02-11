import type { NextApiRequest, NextApiResponse } from "next";

const MEMRE_API_URL = "https://learning-engine.p.rapidapi.com/memre_api/v1";

const handlePost = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { firebaseId } = req.body;

  if (!firebaseId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const options = {
    method: "POST",
    url: `${MEMRE_API_URL}/users`,
    headers: {
      "X-RapidAPI-Key": process.env.MEMRE_API_KEY,
      "X-RapidAPI-Host": "learning-engine.p.rapidapi.com",
    },
  };

  try {
    // Create user in Memre with fetch
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
      res.status(500).json({ message: "No user id returned" });
      return;
    }

    res.status(200).json({ message: "User created", memreId: data.data.id });
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
