# Monochromacy

> Moving Fast, Breaking Everything. That's the Monochromacy way.

A full-stack Next.js site for Monochromacy, including the NPCDetect™ AI interrogation tool.

---

## Project Structure

```
src/
  app/
    page.tsx              → Main site (homepage)
    layout.tsx            → Root layout + fonts
    globals.css           → Global styles + CSS variables
    page.module.css       → Homepage styles
    api/
      chat/
        route.ts          → 🔑 Secure API proxy (key lives here, never in browser)
    npcdetect/
      page.tsx            → NPCDetect™ interrogation app
      npcdetect.module.css
    innovations/
      page.tsx            → Innovations page
    shop/
      page.tsx            → Shop (coming soon)
  components/
    Nav.tsx               → Shared navigation
```

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/monochromacy.git
cd monochromacy
npm install
```

### 2. Add your API key

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

⚠️ **Never commit `.env.local`** — it's in `.gitignore`.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Cloudflare Pages

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — that's the Monochromacy way"
git remote add origin https://github.com/YOUR_USERNAME/monochromacy.git
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → **Create application** → **Pages**
3. Connect your GitHub repo
4. Build settings:
   - **Framework preset:** Next.js
   - **Build command:** `npm run pages:build`
   - **Build output directory:** `.vercel/output/static`

### 3. Add your API key to Cloudflare

In your Cloudflare Pages project:
- Go to **Settings** → **Environment variables**
- Add: `ANTHROPIC_API_KEY` = `sk-ant-your-key-here`
- Set for both **Production** and **Preview**

That's it. Your API key never touches the browser — it lives in Cloudflare's environment and is only used by the `/api/chat` route server-side.

---

## Adding the Shop (Shopify)

When you're ready to add real merch, replace the placeholder button in `src/app/shop/page.tsx` with the Shopify Buy SDK:

```bash
npm install @shopify/buy-button-js
```

Or use Shopify's embeddable buy button (no SDK needed) — generate one from your Shopify admin under **Sales Channels → Buy Button**.

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Main Monochromacy site |
| `/innovations` | Innovations showcase |
| `/npcdetect` | NPCDetect™ AI interrogation |
| `/shop` | Shop (coming soon) |
| `/api/chat` | Secure Anthropic API proxy (POST only) |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key — server-side only |

---

*That's the Monochromacy way.*
