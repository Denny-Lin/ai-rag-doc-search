# RAG pipeline with token-efficient design
# Token usage is primarily affected by the size of the context sent to the LLM.
# This implementation limits input size, chunk count, and context length
# to ensure stability and cost efficiency in production.

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

    # Limit file size to prevent memory overflow (5MB max)
    if len(content) > 5 * 1024 * 1024:
        return {"error": "File too large (max 5MB)"}

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(content)

    text = read_pdf(file_path)

    # Limit total extracted text length to reduce processing load
    text = text[:5000]

    chunks = chunk_text(text)

    # Limit number of chunks to reduce embedding and storage cost
    chunks = chunks[:10]

    embeddings = embed_texts(chunks)

    store_embeddings(chunks, embeddings)

    return {
        "filename": file.filename,
        "chunks_stored": len(chunks)
    }


@app.post("/ask")
async def ask(question: str):

    query_embedding = embed_texts([question])[0]

    # Limit number of retrieved chunks (top_k) to control LLM context size
    results = search(query_embedding, top_k=3)

    # Limit each chunk length before sending to LLM to reduce token usage
    context = "\n\n".join([r[:500] for r in results])

    answer = generate_answer(question, context)

    return {
        "question": question,
        "answer": answer
    }