    # Ecopact (Next.js + Gemini)

Rate Amazon product links for environmental friendliness and suggest greener alternatives. Built with Next.js 14, Tailwind, and Google GenAI SDK.

## Quickstart

1. Install dependencies
```bash
cd next-app
npm install
```
2. Configure environment
```bash
cp .env.example .env.local
# set GEMINI_API_KEY=your_key
# optionally set GEMINI_MODEL_ID (defaults to gemini-flash-latest)
```
3. Run locally
```bash
npm run dev
```
4. Open http://localhost:3000

## API
- `POST /api/rate` body: `{ "url": "https://www.amazon.com/..." }`
- Response: `{ productName, eco: { score, label, breakdown }, alternatives }`

## Deployment (Vercel)
- Root Directory: `next-app`
- Env vars: `GEMINI_API_KEY` (and optional `GEMINI_MODEL_ID`)

## Tuning
See `docs/TUNING.md`. Set `GEMINI_MODEL_ID` to the tuned model when ready. 