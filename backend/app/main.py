# RAG pipeline with token-efficient design
# Token usage is primarily affected by the size of the context sent to the LLM.
# To control cost and latency, this implementation limits:
# - Total extracted text length from documents
# - Number of chunks generated and embedded
# - Number of retrieved chunks used for answering (top_k)
# - Maximum length of each chunk included in the LLM context

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
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    text = read_pdf(file_path)
    text = text[:20000]  # Limit total text length to reduce processing size

    chunks = chunk_text(text)[:50]  # Limit number of chunks to control embedding workload
    embeddings = embed_texts(chunks)

    store_embeddings(chunks, embeddings)

    return {
        "filename": file.filename,
        "chunks_stored": len(chunks)
    }


@app.post("/ask")
async def ask(question: str):
    query_embedding = embed_texts([question])[0]

    results = search(query_embedding, top_k=3)  # Limit retrieved chunks to reduce LLM context size

    context = "\n\n".join([r[:500] for r in results])  
    # Limit each chunk length before sending to LLM to reduce token usage

    answer = generate_answer(question, context)

    return {
        "question": question,
        "answer": answer
    }

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
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    text = read_pdf(file_path)
    text = text[:20000]  # Limit total text length to reduce processing size

    chunks = chunk_text(text)[:50]  # Limit number of chunks to control embedding workload
    embeddings = embed_texts(chunks)

    store_embeddings(chunks, embeddings)

    return {
        "filename": file.filename,
        "chunks_stored": len(chunks)
    }


@app.post("/ask")
async def ask(question: str):
    query_embedding = embed_texts([question])[0]

    results = search(query_embedding, top_k=3)  # Limit retrieved chunks to reduce LLM context size

    context = "\n\n".join([r[:500] for r in results])  
    # Limit each chunk length before sending to LLM to reduce token usage

    answer = generate_answer(question, context)

    return {
        "question": question,
        "answer": answer
    }