# NPCDetect™

> Are you an NPC? Monochromacy's proprietary AI-powered workforce screening protocol will find out.

NPCDetect™ is a satirical AI interview experience. HR-9, a politely menacing AI interviewer, conducts a 7-question behavioral screening and renders a verdict on your NPC status.

## Stack

- **Next.js 15.2.3** with App Router
- **React 19**
- **Anthropic Claude API** (`claude-sonnet-4-6`, via raw fetch — no SDK required)
- Edge runtime API route (`/api/chat`)
- CSS Modules + Google Fonts (IBM Plex Mono, IBM Plex Sans)
- Deploys to **Cloudflare Pages** or **Vercel**

## Getting Started

### 1. Clone or unzip the repo

```bash
git clone https://github.com/your-username/npcdetect.git
cd npcdetect
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your Anthropic API key

Create a `.env.local` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get your API key at [console.anthropic.com](https://console.anthropic.com).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

### Cloudflare Pages

1. Push to a GitHub repository.
2. Connect the repo in [Cloudflare Pages](https://pages.cloudflare.com/).
3. Set the **build command** to: `npx @cloudflare/next-on-pages`
4. Set the **output directory** to: `.vercel/output/static`
5. Add `ANTHROPIC_API_KEY` as an environment variable under **Settings → Environment Variables**.
6. Deploy.

### Vercel

1. Push to a GitHub repository.
2. Import the project in [Vercel](https://vercel.com/).
3. Add `ANTHROPIC_API_KEY` as an environment variable under **Settings → Environment Variables**.
4. Deploy. (Next.js is auto-detected — no build config needed.)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key (starts with `sk-`) |

---

## Project Structure

```
src/
└── app/
    ├── globals.css           — CSS variables, CRT scanline effect
    ├── layout.tsx            — Root layout, Google Fonts
    ├── page.tsx              — NPCDetect™ main page (boot → interview → verdict)
    ├── npcdetect.module.css  — Page styles
    └── api/
        └── chat/
            └── route.ts     — Edge API proxy to Anthropic Claude API
```

---

## Credits

NPCDetect™ is a [Monochromacy](https://monochromacy.com) product. All screenings are confidential.* *They are not.*
