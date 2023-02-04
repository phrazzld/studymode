import axios from "axios";
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
    method: "GET",
    url: `${MEMRE_API_URL}/users`,
    headers: {
      "X-RapidAPI-Key": process.env.MEMRE_API_KEY,
      "X-RapidAPI-Host": "learning-engine.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const user = response.data;
    console.log("Memre user", user);
    res.status(200).json(user);
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
