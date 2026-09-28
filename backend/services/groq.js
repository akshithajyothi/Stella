// backend/services/groq.js
// Thin wrapper over Groq's OpenAI-compatible chat completions API — plain fetch, no SDK.
// Model is a reasoning model (openai/gpt-oss-120b): responses come back with a separate
// `reasoning` field alongside `content`; reasoning_effort:"low" keeps it fast/cheap for a
// conversational agent that doesn't need deep multi-step reasoning.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function isConfigured() {
  return Boolean(process.env.GROQ_API_KEY);
}

async function chatCompletion({ messages, tools, toolChoice, maxTokens = 600 }) {
  if (!isConfigured()) {
    throw new Error("AI agent is not configured — GROQ_API_KEY is missing.");
  }

  const body = {
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    reasoning_effort: "low",
    messages,
    max_tokens: maxTokens,
  };
  if (tools) body.tools = tools;
  if (toolChoice) body.tool_choice = toolChoice;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Groq API error ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  return data.choices[0].message; // { role, content, tool_calls?, reasoning }
}

module.exports = { chatCompletion, isConfigured };
