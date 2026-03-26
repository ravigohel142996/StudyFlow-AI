export async function callAI(
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const apiUrl =
    process.env.AI_API_URL || "https://api.x.ai/v1/chat/completions";
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "grok-beta";

  if (!apiKey) {
    throw new Error("AI_API_KEY environment variable is not set");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}
