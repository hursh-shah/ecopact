# AI Agent Implementation

## Overview

The EcoPact sustainability rating system now uses an AI-powered agent with Gemini 2.0 to intelligently find sustainable product alternatives on Amazon.

## How It Works

### Agent Architecture

The agent uses a systematic search and evaluation process:

1. **Product Rating**: First rates the original product's environmental impact (0-6 scale)
2. **Intelligent Search**: Searches Amazon with eco-focused keywords
3. **Product Evaluation**: Extracts details and rates each alternative using Gemini AI
4. **Smart Filtering**: Only returns products with scores ≥ current product + 1

### Core Functions

#### `rateProductEnvironmentally()`
Uses Gemini AI to rate a product's environmental impact (0-6 scale):
- Analyzes product name, materials, renewed status, and product type
- Considers:
  - % of recycled materials (higher is better)
  - New vs renewed/refurbished (renewed is better)
  - Material sustainability (organic cotton > polyester, bamboo > plastic)
  - Energy consumption in production
  - Recyclability and biodegradability
- Returns: score, label, materials, recyclability, recycled %, biodegradability

#### `findSustainableAlternatives()`
Main agent function that orchestrates the search:
1. Generates eco-focused search queries
2. Searches Amazon for each query
3. Extracts product details from Amazon pages
4. Rates each product using Gemini AI
5. Filters by environmental score threshold
6. Returns top alternatives

### Agent Search Strategy

The agent executes multiple eco-focused searches:

1. `"{product_type} recycled sustainable"`
2. `"{product_type} eco friendly organic"`
3. `"{product_type} renewed refurbished"`
4. `"{product_type} biodegradable recyclable"`

For each search:
- Retrieves up to 4 products from Amazon
- Extracts detailed product information
- Rates environmental impact using AI
- Keeps only products with score ≥ (current_score + 1)
- Stops when 4 good alternatives are found

### Environmental Factors Considered

- **Recycled Materials %**: Higher percentages indicate better sustainability
- **New vs Renewed**: Renewed/refurbished products score higher
- **Material Sustainability**: 
  - High: Organic cotton, bamboo, recycled plastic, recycled aluminum
  - Medium: Glass, stainless steel, natural fibers
  - Low: Virgin plastic, polyester, synthetic materials
- **Recyclability**: Whether the product can be recycled at end of life
- **Biodegradability**: Whether the product breaks down naturally

### API Configuration

- **Endpoint**: `/api/rate`
- **Method**: POST
- **Max Duration**: 60 seconds (configured for fluid compute on Vercel)
- **Model**: Gemini 2.0 Flash Experimental
- **Temperature**: 0.3 (for consistent environmental ratings)

### Response Format

```json
{
  "productName": "iPhone 15 Pro",
  "isRenewed": false,
  "productType": "phone",
  "eco": {
    "score": 2,
    "label": "Low",
    "breakdown": { ... }
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

## Environment Variables

Set one of these in Vercel (the system will use whichever is available):

- `GEMINI_API_KEY`: Your Google AI API key (recommended)
- `GOOGLE_GENERATIVE_AI_API_KEY`: Alternative env var name

The system automatically maps `GEMINI_API_KEY` to `GOOGLE_GENERATIVE_AI_API_KEY` for compatibility with the AI SDK.

## Monitoring

The agent logs detailed progress to console:

```
🤖 Finding sustainable alternatives for: iPhone 15 Pro
📊 Current product score: 2
🎯 Target score: 4 or higher

🔍 Searching: phone recycled sustainable
📦 Extracting details: iPhone 14 Pro (Renewed) - 65% Recycled...
⚖️ Rating product...
  → Score: 5/6 (High), Recycled: 65%
  ✅ Meets criteria! Adding to alternatives.

🔍 Searching: phone eco friendly organic
📦 Extracting details: Fairphone 5 Sustainable Phone...
⚖️ Rating product...
  → Score: 6/6 (Very High), Recycled: 80%
  ✅ Meets criteria! Adding to alternatives.

🎯 Found 4 sustainable alternatives
```

## Performance

- Average response time: 20-40 seconds
- Max duration: 60 seconds  
- Searches performed: 4-8 (depending on how quickly alternatives are found)
- Success rate: High for common product categories (phones, laptops, electronics)
