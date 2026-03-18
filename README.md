# AI RAG Doc Search

An AI-powered RAG (Retrieval-Augmented Generation) SaaS platform for document search, analysis, and question answering. 

Users can upload documents and ask questions — the system retrieves relevant content using vector search and generates answers using LLMs.

---

## Demo Links

- **Frontend**: [https://ai-rag-doc-search.vercel.app](https://ai-rag-doc-search.vercel.app)
- **Backend API**: [https://ai-rag-doc-search.onrender.com/docs](https://ai-rag-doc-search.onrender.com/docs)

---

## Features

- Upload PDF documents for analysis.
- Semantic search using vector embeddings.
- AI-powered Q&A over uploaded documents.
- Modern ChatGPT-style UI built with Next.js.
- End-to-end RAG pipeline integration.
- Full-stack deployment on Vercel and Render.

---

## How It Works (RAG Pipeline)

### Document Processing
Upload file -> Extract text (PDF) -> Chunk text -> Generate embeddings -> Store in vector DB (Chroma)

### Question Answering
User question -> Convert to embedding -> Vector similarity search -> Retrieve relevant chunks -> Send context to LLM (Groq) -> Generate answer

---

## System Architecture

```text
User

  |
Frontend (Next.js)
  |
FastAPI Backend

  |-- Upload API
  |-- RAG pipeline
  |-- Vector search

        |
        |-- Local Storage (uploads/)
        |-- Vector DB (ChromaDB)

        |-- LLM API (Groq)
              |
            Answer
```

---

# Tech Stack

## Backend
- Framework: FastAPI
- Language: Python 3.11+
- Vector Database: ChromaDB
- Embeddings: sentence-transformers (BAAI/bge-small-en)

## Frontend
- Framework: Next.js (App Router)
- Library: React
- Styling: Tailwind CSS

## AI / LLM
- Inference: Groq (Llama-3 models)

## Deployment
- Frontend Hosting: Vercel
- Backend Hosting: Render

---

# Project Structure

```
ai-rag-doc-search/
│
├─ backend/
│  ├─ app/
│  │  ├─ main.py
│  │  ├─ rag/
│  │  │  ├─ chunk.py
│  │  │  ├─ embedding.py
│  │  │  └─ vector_db.py
│  │  ├─ services/
│  │  │  ├─ pdf.py
│  │  │  └─ llm.py
│
├─ frontend/
│  ├─ app/
│  │  └─ page.tsx
│  ├─ components/
│  └─ services/
│
├─ docker/
├─ docker-compose.yml
└─ README.md
```

---

# Getting Started

## 1. Clone Repository

```
git clone https://github.com/your-username/ai-rag-doc-search.git
cd ai-rag-doc-search
```

## 2. Backend Setup

```
cd backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Run Server:

```
uvicorn app.main:app --reload
```

---

## 3. Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

### Environment Variables

Backend `.env` :
```
GROQ_API_KEY=your_key
```

---

# Current Limitations
## 1. Render Cold Start
- Backend sleeps when inactive
- First request can take 20–60 seconds
- Causes slow responses

## 2. High Memory Usage
- sentence-transformers loads embedding model
- Can exceed Render free tier memory
- Previously triggered service restarts

## 3. Slow Embedding Pipeline
- Local embedding is CPU-heavy
- Not suitable for production scale

## 4. No Persistent Storage
- Files stored in /uploads
- Lost after server restarts

## 5. No Streaming Response
- Responses are returned only after full generation
- Not real-time like ChatGPT

---

# Future Improvements
## Performance
- Replace local embedding with API-based embeddings
- Add caching (Redis)

## Architecture
- Move storage to S3 / R2
- Replace Chroma with Qdrant / Pinecone

## UX
- Streaming responses
- Better loading states
- File upload progress

## Features
- Multi-document search
- User authentication
- Chat history
- Source citation

---

# Key Learnings
- Built a full RAG pipeline from scratch
- Implemented vector search + embeddings
- Deployed full-stack AI system
- Understood cloud limitations (memory / cold start)
- Optimized token usage and performance

---

# Summary
This project demonstrates how to build a real-world AI RAG system:

- Document → Embedding → Vector Search → LLM
- Full-stack deployment (Next.js + FastAPI)
- Real production constraints and trade-offs

