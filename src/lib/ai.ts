// AI provider abstraction layer.
// Switch providers by setting AI_PROVIDER in Cloudflare Pages → Settings → Environment Variables.
// Valid values: "anthropic" (default), "openai", "deepseek", "gemini"
// Each provider needs its own API key env var (see CloudflareEnv in cloudflare-env.d.ts).

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AICallOptions {
  messages: AIMessage[];
  systemPrompt: string;
  maxTokens: number;
}

type AIProvider = "anthropic" | "openai" | "deepseek" | "gemini";

interface ProviderAdapter {
  call(options: AICallOptions, apiKey: string): Promise<string>;
}

// ─── Anthropic ────────────────────────────────────────────────────────────────

const anthropicAdapter: ProviderAdapter = {
  async call({ messages, systemPrompt, maxTokens }, apiKey) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Anthropic error ${response.status}: ${(err as { error?: { message?: string } })?.error?.message ?? JSON.stringify(err)}`
      );
    }

    const data = await response.json() as { content?: { text?: string }[] };
    if (!data?.content?.[0]?.text) {
      throw new Error("Unexpected response shape from Anthropic API");
    }
    return data.content[0].text;
  },
};

// ─── OpenAI-compatible (OpenAI + Deepseek share the same format) ──────────────

function createOpenAICompatAdapter(baseUrl: string, model: string): ProviderAdapter {
  return {
    async call({ messages, systemPrompt, maxTokens }, apiKey) {
      const allMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
      ];

      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: allMessages,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          `AI error ${response.status}: ${(err as { error?: { message?: string } })?.error?.message ?? JSON.stringify(err)}`
        );
      }

      const data = await response.json() as { choices?: { message?: { content?: string } }[] };
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error("Unexpected response shape from OpenAI-compatible API");
      }
      return data.choices[0].message.content;
    },
  };
}

const openaiAdapter = createOpenAICompatAdapter("https://api.openai.com", "gpt-4o");
const deepseekAdapter = createOpenAICompatAdapter("https://api.deepseek.com", "deepseek-chat");

// ─── Gemini ───────────────────────────────────────────────────────────────────
// Must use v1beta — v1 does not support systemInstruction.
// API key goes in the URL (Google's standard REST auth pattern).
// Role mapping: "assistant" → "model" (Gemini rejects "assistant").

const geminiAdapter: ProviderAdapter = {
  async call({ messages, systemPrompt, maxTokens }, apiKey) {
    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const geminiContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: geminiContents,
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini error ${response.status}: ${(err as { error?: { message?: string } })?.error?.message ?? JSON.stringify(err)}`
      );
    }

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Unexpected response shape from Gemini API");
    }
    return data.candidates[0].content!.parts![0].text!;
  },
};

// ─── Key name lookup (for error messages) ─────────────────────────────────────

const KEY_NAMES: Record<AIProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  gemini: "GEMINI_API_KEY",
};

// ─── Public entry point ───────────────────────────────────────────────────────

export async function callAI(options: AICallOptions): Promise<string> {
  const provider = (process.env.AI_PROVIDER ?? "anthropic") as AIProvider;

  const adapterMap: Record<AIProvider, ProviderAdapter> = {
    anthropic: anthropicAdapter,
    openai: openaiAdapter,
    deepseek: deepseekAdapter,
    gemini: geminiAdapter,
  };

  const adapter = adapterMap[provider];
  if (!adapter) {
    throw new Error(
      `Unknown AI_PROVIDER: "${provider}". Must be one of: anthropic, openai, deepseek, gemini`
    );
  }

  const apiKey = process.env[KEY_NAMES[provider]];
  if (!apiKey) {
    throw new Error(
      `API key not configured for provider "${provider}". ` +
      `Set ${KEY_NAMES[provider]} in Cloudflare Pages → Settings → Environment Variables.`
    );
  }

  return adapter.call(options, apiKey);
}
