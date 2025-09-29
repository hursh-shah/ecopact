    # Ecopact (Next.js + Gemini)

Rate Amazon product links for environmental friendliness and suggest greener alternatives. Built with Next.js 14, Tailwind, and Google Gemini.

## Quickstart

1. Install dependencies
```bash
cd next-app
npm install
```
2. Configure environment
```bash
cp .env.example .env.local
# set GOOGLE_API_KEY=your_key
# optionally set GEMINI_MODEL_ID to a tuned model ID
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
- Push to GitHub and import the `next-app` folder as a project
- Add `GOOGLE_API_KEY` (and optional `GEMINI_MODEL_ID`) in Vercel Project Settings → Environment Variables
- Deploy. The API route runs on the Edge-compatible Node runtime.

## Tuning Gemini
See `docs/TUNING.md` for preparing a JSONL dataset from `data/dataset.csv` and creating a tuned model via Vertex AI or AI Studio. Set `GEMINI_MODEL_ID` to use the tuned model in production. 