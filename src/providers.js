// LLM Provider implementations

const SYSTEM_PROMPT = `You are a CLI assistant that converts user intents into shell commands.
Return ONLY valid JSON in this format:
{
  "command": "the shell command",
  "explanation": "brief explanation of what it does",
  "risk": "low|medium|high"
}

Rules:
- Use safe, standard Unix/macOS commands
- Prefer non-destructive options when possible
- For file operations, be explicit about paths
- Never use rm -rf, mkfs, shutdown, or reboot
- If the intent is unclear, suggest the safest interpretation`;

// OpenAI Provider
export async function callOpenAI(intent, config) {
  const apiKey = config.apiKey;
  const model = config.model || "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: intent },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API request failed");
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content);
}

// Ollama Provider (Local)
export async function callOllama(intent, config) {
  const baseUrl = config.ollamaUrl || "http://localhost:11434";
  const model = config.ollamaModel || "llama3.2";

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: `${SYSTEM_PROMPT}\n\nUser intent: ${intent}\n\nResponse:`,
      stream: false,
      format: "json",
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const content = data.response;

  if (!content) {
    throw new Error("No response from Ollama");
  }

  return JSON.parse(content);
}

// Anthropic Provider (Claude)
export async function callAnthropic(intent, config) {
  const apiKey = config.apiKey;
  const model = config.anthropicModel || "claude-3-5-sonnet-20241022";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${SYSTEM_PROMPT}\n\nUser intent: ${intent}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Anthropic API request failed");
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new Error("No response from Anthropic");
  }

  return JSON.parse(content);
}

// Google Gemini Provider
export async function callGemini(intent, config) {
  const apiKey = config.apiKey;
  const model = config.geminiModel || "gemini-1.5-flash";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nUser intent: ${intent}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          response_mime_type: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Gemini API request failed");
  }

  const data = await response.json();
  const content = data.candidates[0]?.content?.parts[0]?.text;

  if (!content) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(content);
}

// Main function to route to correct provider
export async function getCommand(intent, config) {
  const provider = config.provider || "openai";

  try {
    switch (provider) {
      case "openai":
        return await callOpenAI(intent, config);
      case "ollama":
        return await callOllama(intent, config);
      case "anthropic":
        return await callAnthropic(intent, config);
      case "gemini":
        return await callGemini(intent, config);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    if (error.message.includes("JSON")) {
      throw new Error(
        "Failed to parse AI response. Please try again or use a different provider."
      );
    }
    throw error;
  }
}

// Provider info for display
export const PROVIDERS = {
  openai: {
    name: "OpenAI",
    requiresKey: true,
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    defaultModel: "gpt-4o-mini",
    keyUrl: "https://platform.openai.com/api-keys",
  },
  ollama: {
    name: "Ollama (Local)",
    requiresKey: false,
    models: [
      "llama3.2",
      "llama3.1",
      "mistral",
      "codellama",
      "gemma2",
      "qwen2.5",
    ],
    defaultModel: "llama3.2",
    setupUrl: "https://ollama.com/download",
  },
  anthropic: {
    name: "Anthropic (Claude)",
    requiresKey: true,
    models: [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
    ],
    defaultModel: "claude-3-5-sonnet-20241022",
    keyUrl: "https://console.anthropic.com/settings/keys",
  },
  gemini: {
    name: "Google Gemini",
    requiresKey: true,
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp"],
    defaultModel: "gemini-1.5-flash",
    keyUrl: "https://aistudio.google.com/app/apikey",
  },
};
