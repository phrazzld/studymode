export default async function handler(req, res) {
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
