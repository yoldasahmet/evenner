// OpenAI-compatible chat-completions client covering OpenRouter and OpenAI,
// used as alternative providers to Anthropic. Fetch-based: no SDK required.
// OpenRouter defaults to free-tier models; they get rate-limited upstream,
// so we walk a fallback list until one answers. Override with
// OPENROUTER_MODEL / OPENAI_MODEL.

export type CompatProvider = "openrouter" | "openai";

// Free models verified to support structured outputs, best first.
const OPENROUTER_FREE_MODELS = [
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nex-agi/nex-n2-pro:free",
  "nvidia/nemotron-nano-9b-v2:free",
];

const ENDPOINTS: Record<
  CompatProvider,
  { url: string; keyEnv: string; modelEnv: string; defaultModels: string[] }
> = {
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    keyEnv: "OPENROUTER_API_KEY",
    modelEnv: "OPENROUTER_MODEL",
    defaultModels: OPENROUTER_FREE_MODELS,
  },
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    keyEnv: "OPENAI_API_KEY",
    modelEnv: "OPENAI_MODEL",
    defaultModels: ["gpt-4o-mini"],
  },
};

// Models occasionally wrap JSON in prose or code fences; cut to the braces.
function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return start >= 0 && end > start ? text.slice(start, end + 1) : text;
}

async function requestOnce(
  url: string,
  apiKey: string,
  model: string,
  prompt: string,
  schema: object
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: { name: "result", strict: true, schema },
      },
    }),
  });

  if (!res.ok) throw new Error(`${model}: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };
  // OpenRouter can return 200 with an embedded provider error.
  if (data.error) throw new Error(`${model}: ${data.error.message}`);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${model}: no content in response`);
  return text;
}

/**
 * Sends a single-turn prompt with a strict JSON Schema response format and
 * returns the JSON text of the assistant message. Tries each candidate model
 * until one succeeds (free tiers rate-limit unpredictably).
 */
export async function openAiCompatJson(
  provider: CompatProvider,
  prompt: string,
  schema: object
): Promise<string> {
  const cfg = ENDPOINTS[provider];
  const apiKey = process.env[cfg.keyEnv];
  if (!apiKey) throw new Error(`${cfg.keyEnv} is not set`);

  const override = process.env[cfg.modelEnv];
  const models = override ? [override] : cfg.defaultModels;

  let lastError: unknown;
  for (const model of models) {
    try {
      return extractJson(await requestOnce(cfg.url, apiKey, model, prompt, schema));
    } catch (e) {
      lastError = e;
      console.error(`[evenner] ${provider} model failed, trying next:`, e);
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`${provider}: all models failed`);
}
