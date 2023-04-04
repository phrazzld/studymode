import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _req: NextApiRequest,
  _res: NextApiResponse
) {
  const query = new URLSearchParams({
    query: "keepalive",
    userId: "keepalive",
  });
  await fetch(`/api/embeddings?${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
