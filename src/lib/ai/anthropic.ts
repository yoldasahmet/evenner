// Minimal fetch-based Anthropic Messages API client. We deliberately avoid
// the @anthropic-ai/sdk dependency so no install step is required.

export const LLM_MODEL = "claude-opus-4-8";

const API_URL = "https://api.anthropic.com/v1/messages";

interface ContentBlock {
  type: string;
  text?: string;
}

/**
 * Sends a single-turn prompt and returns the text of the structured-output
 * response. `schema` is a JSON Schema the model's output must conform to.
 */
export async function anthropicJson(
  prompt: string,
  schema: object
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { format: { type: "json_schema", schema } },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { content?: ContentBlock[] };
  const text = data.content?.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Anthropic API returned no text block");
  return text;
}
