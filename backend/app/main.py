from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware  # Required for frontend access
import os
from app.services.pdf import read_pdf
from app.rag.chunk import chunk_text
from app.rag.embedding import embed_texts
from app.rag.vector_db import store_embeddings, search
from app.services.llm import generate_answer

app = FastAPI()

# --- STEP 1: Enable CORS (Critical for Frontend-Backend connection) ---
# Without this, the browser will block requests from your Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins; change to your domain in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, etc.
    allow_headers=["*"],  # Allows all headers
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def root():
    """Health check endpoint to verify server status."""
    return {"message": "RAG API running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Handles PDF upload, extraction, and embedding storage."""
    content = await file.read()

    # Limit file size (3MB) to prevent Render free tier memory overflow
    if len(content) > 3 * 1024 * 1024:
        return {"error": "File too large (max 3MB)"}

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(content)

    # Extract text from PDF
    text = read_pdf(file_path)

    # Limit text length to 3000 chars to control processing load
    text = text[:3000]

    # Split text into chunks
    chunks = chunk_text(text)

    # Limit to top 5 chunks to reduce embedding API costs and memory
    chunks = chunks[:5]

    if not chunks:
        return {"error": "No readable content found in PDF"}

    # Generate embeddings and store them in the local vector DB
    embeddings = embed_texts(chunks)
    store_embeddings(chunks, embeddings)

    return {
        "filename": file.filename,
        "chunks_stored": len(chunks)
    }

@app.post("/ask")
async def ask(question: str = Query(...)):
    """Retrieves relevant context and generates an answer via Groq LLM."""
    
    # 1. Convert the user's question into an embedding
    query_embedding = embed_texts([question])[0]

    # 2. Retrieve top 3 relevant chunks from the vector database
    results = search(query_embedding, top_k=3)

    if not results:
        return {
            "question": question,
            "answer": "No relevant context found. Please upload a document first."
        }

    # 3. Format context (limit each chunk to 500 chars for token efficiency)
    context = "\n\n".join([r[:500] for r in results])

    # 4. Generate the final answer using the Groq LLM service
    answer = generate_answer(question, context)

    return {
        "question": question,
        "answer": answer
    }
