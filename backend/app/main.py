from fastapi import FastAPI, UploadFile, File
import os
from app.services.pdf import read_pdf
from app.rag.chunk import chunk_text

app = FastAPI()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def root():
    return {"message": "RAG API running"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    text = read_pdf(file_path)
    chunks = chunk_text(text)

    return {
        "filename": file.filename,
        "chunks_count": len(chunks),
        "preview": chunks[:2]
    }