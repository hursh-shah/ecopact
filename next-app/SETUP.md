# Setup Guide for AI Agent

## Quick Start

### 1. Environment Variables

In your Vercel dashboard, add the following environment variable:

```
GEMINI_API_KEY=your_google_ai_api_key_here
```

Or alternatively:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
```

### 2. Dependencies

The following packages are already installed:
- `ai` - Vercel AI SDK
- `@ai-sdk/google` - Google AI provider for AI SDK
- `@google/generative-ai` - Google Generative AI SDK
- `zod` - Schema validation
- `cheerio` - Web scraping

### 3. Deploy to Vercel

```bash
vercel deploy
```

The app will automatically:
- Use Vercel's fluid compute for long-running agent tasks
- Support up to 60 seconds for agent operations
- Scale automatically based on usage

## How to Use

### Rate a Product

1. Go to `/rate` page
2. Paste an Amazon product URL
3. Click "Analyze"
4. Wait 20-40 seconds for:
   - Product environmental rating
   - AI-powered sustainable alternatives with ratings

### What You'll Get

**For the original product:**
- Environmental score (0-6)
- Detailed breakdown (materials, recyclability, emissions, etc.)
- Product type detection
- Renewed/refurbished status

**For alternatives:**
- Product name with Amazon link
- Environmental score (always better than original)
- % of recycled materials
- Recyclability status
- Biodegradability status
- Materials used
- Renewed/refurbished badge

## Architecture

```
User submits Amazon URL
       ↓
Extract product info (scrape Amazon)
       ↓
Rate product with Gemini AI (0-6 scale)
       ↓
Agent searches for alternatives:
  1. Search Amazon with eco keywords
  2. Extract details from each result
  3. Rate with Gemini AI
  4. Keep only high-scoring items
       ↓
Return top 4 sustainable alternatives
```

## Troubleshooting

### "Missing API Key" Error
- Ensure `GEMINI_API_KEY` is set in Vercel environment variables
- Redeploy after adding the environment variable

### "Timeout" Error
- The agent has 60 seconds max duration
- Some products may have limited alternatives available
- Try a more common product category

### No Alternatives Found
- The agent only returns alternatives with scores ≥ current + 1
- If the original product is already very sustainable (score 5-6), there may be no better alternatives
- Try searching for a less sustainable product to see alternatives

### Build Errors
Run these commands to verify:
```bash
npm run typecheck
npm run build
```

## Local Development

```bash
# Install dependencies
npm install

# Add .env.local with your API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run development server
npm run dev
```

Visit http://localhost:3000/rate to test the agent.

## API Endpoints

### POST `/api/rate`

**Request:**
```json
{
  "url": "https://www.amazon.com/dp/B0XXXXXXXX"
}
```

**Response:**
```json
{
  "productName": "iPhone 15 Pro",
  "isRenewed": false,
  "productType": "phone",
  "eco": {
    "score": 2,
    "label": "Low",
    "breakdown": {
      "materials": ["aluminum", "glass"],
      "recyclability": "Partial",
      "recycled_materials_percentage": "20%",
      ...
    }
  },
  "alternatives": [
    {
      "name": "iPhone 14 Pro (Renewed)",
      "scoreLabel": "High",
      "score": 5,
      "materials": "recycled aluminum, glass",
      "link": "https://amazon.com/...",
      "recyclability": "Yes",
      "recycledPercentage": "65%",
      "biodegradability": "Partial",
      "isRenewed": true
    }
  ]
}
```

## Key Features

✅ **AI-Powered Rating**: Uses Gemini 2.0 for environmental assessment  
✅ **Intelligent Search**: Multi-query eco-focused Amazon search  
✅ **Quality Filtering**: Only shows genuinely better alternatives  
✅ **Detailed Metrics**: Recycled %, materials, recyclability, biodegradability  
✅ **Renewed Detection**: Prioritizes refurbished/renewed products  
✅ **Long-Running Support**: 60s max duration with Vercel fluid compute  

## Learn More

- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Google AI Documentation](https://ai.google.dev/docs)
- [Agent Implementation Details](./docs/AGENT.md)
