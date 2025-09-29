# Tuning Gemini for Ecopact

This app can run with a tuned Gemini model to improve consistency of ratings. You can use Vertex AI Tuning or AI Studio Tuning (if available in your region/account).

## 1) Prepare a JSONL dataset
```bash
npm run tuning:prepare
```
This creates `tuning/train.jsonl` using `data/dataset.csv`. Each line is `{input_text, output_text}` with the API JSON output as `output_text`.

## 2) Create a tuned model

Option A: Vertex AI (recommended for production)
- In Google Cloud, enable Vertex AI and set a project/region
- Upload `tuning/train.jsonl` to Cloud Storage
- In Vertex AI Console → Model Garden → Gemini → "Tune model"
  - Select base model (e.g., `gemini-1.0-pro` or a supported tuning variant)
  - Provide the GCS path to `train.jsonl`
  - Start tuning and wait for completion
- Note the tuned model resource name (e.g., `projects/..../locations/..../tunedModels/your-model`)

Option B: AI Studio Tuning (if available)
- Go to AI Studio → Tune → Create tuned model
- Upload `train.jsonl` and follow prompts
- Note the tuned model ID

## 3) Use the tuned model in the app
Set `GEMINI_MODEL_ID` in `.env.local` (or on Vercel):
```
GEMINI_MODEL_ID=projects/..../locations/..../tunedModels/your-model
```
The API will use this model instead of the default.

## Tips
- Keep outputs strictly valid JSON; the provided dataset ensures that format
- You can add your own examples to `data/dataset.csv` to bias toward your domain
- Consider evaluating with a holdout set if you expand the dataset 