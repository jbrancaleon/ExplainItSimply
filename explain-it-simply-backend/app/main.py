from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

COMPLEXITY_PROMPTS = {
    "kid": "Explain this like I'm a 10-year-old. Use simple words, short sentences, and fun analogies. Avoid jargon entirely.",
    "teen": "Explain this for a smart teenager. Use clear language, relatable examples, and define any technical terms simply.",
    "adult": "Simplify this for a general adult audience. Keep it clear and concise, using everyday language. Define technical terms briefly.",
    "expert": "Summarize this for an expert audience. Keep the key technical details but make it more concise and well-structured.",
}


class SimplifyRequest(BaseModel):
    text: str
    level: str = "adult"


class SimplifyResponse(BaseModel):
    simplified: str
    level: str
    original_length: int
    simplified_length: int


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/api/simplify", response_model=SimplifyResponse)
async def simplify_text(request: SimplifyRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if request.level not in COMPLEXITY_PROMPTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid level. Choose from: {', '.join(COMPLEXITY_PROMPTS.keys())}",
        )

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    client = OpenAI(api_key=api_key)

    system_prompt = (
        "You are ExplainItSimply, an AI that makes complex topics easy to understand. "
        "Your job is to take any text and rewrite it so it's clear and accessible. "
        "Keep the core meaning intact. Use analogies where helpful. "
        "Format your response in clean paragraphs. Do not include any preamble like 'Here is the simplified version'. "
        "Just output the simplified text directly."
    )

    user_prompt = f"{COMPLEXITY_PROMPTS[request.level]}\n\nText to simplify:\n{request.text}"

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        simplified = response.choices[0].message.content or ""
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI simplification failed: {str(e)}")

    return SimplifyResponse(
        simplified=simplified.strip(),
        level=request.level,
        original_length=len(request.text),
        simplified_length=len(simplified.strip()),
    )
