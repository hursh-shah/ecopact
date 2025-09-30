# Ecopact (Next.js + Gemini)

Rate Amazon product links for environmental friendliness and suggest greener alternatives. Built with Next.js 14, Tailwind, and Google Gemini. All Next.js code in root directory next-app, with other files saved for archiving purposes.

Winner of the 450 participant HackBytes II ($46,000 in prizes)

## Quickstart

1. Install dependencies
```bash
cd next-app
npm install
```
2. Configure environment
```bash
auth cp .env.example .env.local
# Set GEMINI_API_KEY=your_key  (or GOOGLE_API_KEY for backward compat)
# Optionally set GEMINI_MODEL_ID (aliases supported: gemini-flash-latest → gemini-1.5-flash)
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
- Set Root Directory to `next-app`
- Add `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) and optional `GEMINI_MODEL_ID` in Project Settings → Environment Variables
- Deploy

## Tuning Gemini
See `docs/TUNING.md` for preparing a JSONL dataset and creating a tuned model. Set `GEMINI_MODEL_ID` to your tuned model ID. 

