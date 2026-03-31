import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_pdf_text(text):
    # 1. Remove long underscores
    text = re.sub(r'_+', ' ', text)
    # 2. Fix "BibekPoudel" -> "Bibek Poudel" (Adds space before capital letters)
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
    # 3. Remove technical headers
    text = text.replace("EventKnowledgeBaseDocument", "")
    text = text.replace("Thisdocumentstoresstructuredinformationaboutevents", "")
    # 4. Normalize spaces
    return " ".join(text.split())

def get_pdf_text(pdf_path):
    raw_text = ""
    try:
        if not os.path.exists(pdf_path):
            return ""
        with open(pdf_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                raw_text += page.extract_text() + " "
        return clean_pdf_text(raw_text)
    except Exception as e:
        print(f"Error: {e}")
        return ""

PDF_CONTENT = get_pdf_text("try.pdf")

class ChatRequest(BaseModel):
    prompt: str

@app.post("/api/chat/ask")
async def ask_bot(request: ChatRequest):
    query = request.prompt.lower().strip()
    
    if not PDF_CONTENT:
        return {"response": "I cannot access the event details right now."}

    # --- CATEGORY-BASED EXTRACTION ---
    
    # 1. HOST SEARCH
    if "host" in query or "anchor" in query:
        # Improved Regex: Looks for 'Host Name' and captures until it hits another label like 'Host Role'
        match = re.search(r"Host Name\s*[:→\-]?\s*([A-Za-z\s]+?)(?=Host Role|$)", PDF_CONTENT, re.IGNORECASE)
        if match:
            return {"response": f"The host of the show is {match.group(1).strip()}."}

    # 2. SHOW DETAILS / EVENT OVERVIEW
    if "about the show" in query or "event details" in query or "tell me more" in query:
        # Captures the Event Name and Type
        event_match = re.search(r"Event Name\s*[:→\-]?\s*([A-Za-z\s]+)Event Type", PDF_CONTENT, re.IGNORECASE)
        venue_match = re.search(r"Venue\s*[:→\-]?\s*([A-Za-z\s,]+)City", PDF_CONTENT, re.IGNORECASE)
        
        if event_match and venue_match:
            return {
                "response": f"The show is '{event_match.group(1).strip()}', a live concert happening at {venue_match.group(1).strip()}."
            }

    # 3. CELEBRITY SEARCH
    if "celebrity" in query or "singer" in query or "sushant" in query:
        match = re.search(r"Celebrity Name\s*[:→\-]?\s*([A-Za-z\s]+?)(?=Celebrity Role|$)", PDF_CONTENT, re.IGNORECASE)
        if match:
            return {"response": f"The main celebrity for the night is {match.group(1).strip()}."}

    # FALLBACK: If specific logic fails, try a keyword sentence search
    sentences = PDF_CONTENT.split('.')
    for s in sentences:
        if any(word in s.lower() for word in query.split() if len(word) > 3):
            return {"response": s.strip() + "."}

    return {"response": "I couldn't find those specific details. Try asking about the 'host', 'celebrity', or 'venue'."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)