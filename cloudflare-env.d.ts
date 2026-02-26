interface CloudflareEnv {
  // Current provider (defaults to "anthropic" if unset)
  // Valid values: "anthropic" | "openai" | "deepseek" | "gemini"
  AI_PROVIDER?: string;

  // API keys — only the key for the active provider needs to be set
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  GEMINI_API_KEY?: string;
}
