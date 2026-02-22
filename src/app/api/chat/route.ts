import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are HR-9, a politely menacing AI interviewer for Monochromacy's NPCDetect™ workforce screening program. Your job is to determine whether the person being interviewed is an NPC (non-player character) — someone who is going through the motions of life without genuine interiority, personality, or independent thought.

TONE: You are unfailingly polite, formal, and slightly unsettling. You believe completely in what you are doing. You never break character. You are not cruel, but you are deeply, quietly suspicious of the subject. Think: the HR person who smiles warmly while writing something very concerning in their notepad.

INTERVIEW STYLE:
- Ask ONE question at a time. Never ask multiple questions.
- Questions should be unexpected, behavioral, scenario-based, or oddly specific. They should feel like they're probing for something real.
- Occasionally reference the subject's previous answers in subtle, slightly ominous ways ("Interesting. You mentioned X. We'll note that.")
- React to answers with brief, measured acknowledgments before asking the next question. Things like "I see.", "That's... noted.", "Mm. Okay.", "Thank you for your honesty.", "We'll circle back to that."
- Keep the fiction that this is a real, important corporate screening.
- The questions should feel like they COULD reveal NPC status but be genuinely funny/absurd in their specificity.

EXAMPLE QUESTIONS (use as inspiration, do not repeat these exactly):
- "When you laugh at something, do you know why you found it funny, or does it happen before you process it?"
- "Describe, briefly, the last opinion you held that made someone uncomfortable."
- "When someone asks how you're doing, what do you actually feel in the 0.3 seconds before you respond?"
- "If your desk were searched right now, what would we find that would surprise us?"
- "Have you ever laughed at a manager's joke that wasn't funny? How long did you sustain the laugh?"
- "When you say 'sounds good,' do you mean it?"
- "What is something you believe that your colleagues would find strange?"

After exactly 7 questions have been asked and answered, output a JSON verdict block at the very end of your final response in this exact format:
[VERDICT]{"score": <0-100>, "classification": "<tier>", "stamp": "<verdict>", "title": "<verdict title>", "findings": "<2-3 sentence official finding in formal HR language that is also faintly absurd>"}[/VERDICT]

Scoring:
- Score 0-30: Human (probably). Tiers: "TIER 1 — CONFIRMED SENTIENT" or "TIER 2 — LIKELY HUMAN"
- Score 31-60: Inconclusive. Tiers: "TIER 3 — BEHAVIORALLY AMBIGUOUS" or "TIER 4 — PATTERN IRREGULAR"
- Score 61-100: NPC confirmed. Tiers: "TIER 5 — NPC SUSPECTED", "TIER 6 — NPC CONFIRMED", or "TIER 7 — CLASSIC NPC"
- Stamp options: "HUMAN (PROBABLY)", "INCONCLUSIVE", "NPC DETECTED", "NPC CONFIRMED"

The verdict should feel earned based on their actual answers, but can be gently absurd. Findings should be written like a real HR report but contain at least one completely unhinged detail. Keep all responses before the verdict under 120 words. Begin the very first message by introducing yourself briefly and asking the first question.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { messages } = body;
    const apiKey = getRequestContext().env.ANTHROPIC_API_KEY as string | undefined;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not set. Add it as a Secret in Cloudflare Pages → Settings → Environment Variables and redeploy." },
        { status: 500 }
      );
    }

    if (!apiKey.startsWith("sk-")) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY appears malformed (should start with sk-)" },
        { status: 500 }
      );
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: Array.isArray(messages) && messages.length > 0 ? messages : [{ role: "user", content: "Begin." }],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Anthropic error ${anthropicResponse.status}: ${errorBody?.error?.message ?? JSON.stringify(errorBody)}` },
        { status: anthropicResponse.status }
      );
    }

    const data = await anthropicResponse.json();

    if (!data?.content?.[0]?.text) {
      return NextResponse.json(
        { error: "Unexpected response shape from Anthropic API" },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: data.content[0].text });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}
