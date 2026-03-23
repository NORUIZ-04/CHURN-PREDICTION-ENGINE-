export async function fetchInsights() {
  const res = await fetch("/api/insights/latest", {
    headers: {
      "Cache-Control": "no-cache"
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch insights");
  }

  return await res.json();
}