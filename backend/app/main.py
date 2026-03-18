# RAG pipeline with token-efficient design
# This implementation controls memory usage and token cost by:
# - Limiting uploaded file size
# - Limiting extracted text length
# - Limiting number of chunks
# - Limiting retrieved context size

from fastapi import FastAPI, UploadFile, File
import os
from app.services.pdf import read_pdf
from app.rag.chunk import chunk_text
from app.rag.embedding import embed_texts
from app.rag.vector_db import store_embeddings, search
from app.services.llm import generate_answer

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def root():
    return {"message": "RAG API running"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    content = await file.read()

    # Limit file size to prevent memory overflow (3MB recommended for Render free tier)
    if len(content) > 3 * 1024 * 1024:
        return {"error": "File too large (max 3MB)"}

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(content)

    text = read_pdf(file_path)

    # Limit extracted text length to control processing load (main bottleneck)
    text = text[:3000]

    chunks = chunk_text(text)

    # Limit number of chunks to reduce embedding cost and memory usage
    chunks = chunks[:5]

    # Safety check (avoid empty embedding crash)
    if not chunks:
        return {"error": "No readable content found in PDF"}

    embeddings = embed_texts(chunks)

    store_embeddings(chunks, embeddings)

    return {
        "filename": file.filename,
        "chunks_stored": len(chunks)
    }


@app.post("/ask")
async def ask(question: str):

    # Convert query into embedding
    query_embedding = embed_texts([question])[0]

    # Retrieve top relevant chunks (limit = 3 to control token usage)
    results = search(query_embedding, top_k=3)

    # Handle empty search result (avoid LLM hallucination)
    if not results:
        return {
            "question": question,
            "answer": "No relevant context found. Please upload a document first."
        }

    # Limit each chunk length before sending to LLM
    context = "\n\n".join([r[:500] for r in results])

    answer = generate_answer(question, context)

    return {
        "question": question,
        "answer": answer
    }