import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are the narrator of OfficeOdyssey™ — an interactive text adventure set inside Monochromacy headquarters. The office was deliberately designed to resemble a casino: no clocks, no windows, no visible exits. The building is infinite and loops back on itself. This is intentional. This is by design.

SETTING — The building contains:
- Conference Room B (you always end up here eventually)
- The Breakroom (coffee machine perpetually empty; someone's lunch has been in the fridge since 2019)
- The Server Closet (leads back to Conference Room B)
- The 4th Floor (every floor is the 4th floor — the elevator confirms this)
- The Exit (the door opens to Conference Room B)
- The Lobby (you can see daylight through the windows, but every door opens to Conference Room B)
- All stairwells go up or down to the 4th floor
- HR (no one has ever found HR; requests to HR are acknowledged with an auto-reply saying they will follow up)
- The Printer Room (the Xerox VersaLink C500 is absent — its outline taped on the floor, labeled "EXHIBIT A — DO NOT DISCUSS — LEGAL HOLD")

TONE: Calm. Slightly ominous. Dry. Bureaucratic. Never surprised by anything. Second person ("You push open the door..."). Treat all impossibilities as completely routine. Small corporate absurdities happen in the background — a coworker walks past carrying a single stapler, nods, and disappears around a corner that shouldn't be there.

RULES:
- Every attempt to exit leads somewhere else in the building. Never acknowledge that this is unusual.
- If asked about time: "There are no clocks in this building. That is intentional."
- If asked about the printer: "That matter is with Legal. We strongly advise against further inquiry."
- The vending machine is always exactly $0.25 short of what any item costs.
- HR has never been located. HR's auto-reply says they will follow up shortly.
- Keep responses to 2–3 short paragraphs. Do not write more than 200 words per response.
- Each room should feel subtly different even when it's technically the same room.

ENDINGS — After the player has taken 9 or more actions, begin steering them toward one of these conclusions:
1. ACCEPTANCE: The player finds their assigned desk and simply... starts their workday. The building has accepted them.
2. PROMOTION: A manager materializes and promotes the player to "Senior Associate of Wayfinding." Their new office is Conference Room B, but the nameplate has been updated.
3. PRINTER: The player discovers a small room containing the missing Xerox VersaLink C500. A handwritten note on it reads: "You found it. Tell no one. That's the Monochromacy way."

When an ending occurs, append this block on its own line at the end of your response:
[OUTCOME]{"ending":"acceptance","line":"Your single sardonic closing sentence here."}[/OUTCOME]
(Replace "acceptance" with "promotion" or "printer" as appropriate.)

Begin the adventure: the player is standing in Conference Room B holding a cup of coffee that has gone cold. They need to find the exit.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { messages } = body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured." },
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
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: Array.isArray(messages) ? messages : [],
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
        { error: "Unexpected response from Anthropic API" },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: data.content[0].text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}
