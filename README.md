# AI RAG Doc Search

AI-powered RAG (Retrieval-Augmented Generation) SaaS platform for document search, analysis, and question answering. Upload documents and ask questions — the system retrieves relevant content using vector search and generates answers with LLMs.

---

# Features

- Upload documents (PDF / DOCX / TXT)
- Semantic search using vector database
- AI-powered question answering
- FastAPI backend with async support
- Local embedding (no cost)
- Cloud-ready (Docker + Fly.io / AWS)

---

# How It Works (RAG Pipeline)

## Document Processing

```
Upload document
↓
Parse file
↓
Split into chunks
↓
Generate embeddings
↓
Store in vector database
```

## Question Answering

```
User question
↓
Convert to embedding
↓
Vector search
↓
Retrieve relevant chunks
↓
Send to LLM
↓
Generate answer
```

---

# System Architecture

```
User
↓
Frontend (Next.js / React)
↓
FastAPI Backend
├─ Authentication
├─ Upload API
├─ RAG pipeline
↓
Object Storage (R2 / S3)
↓
Vector DB (Qdrant)
↓
LLM API (Gemini / Groq)
↓
Answer
```

---

# Tech Stack

## Backend
- FastAPI
- Python

## Frontend
- Next.js / React

## Database
- PostgreSQL (Neon / Supabase)

## Storage
- Cloudflare R2 / AWS S3

## Vector Database
- Qdrant

## Embedding
- BAAI/bge-small-en

## LLM
- Gemini / Groq

## Deployment
- Docker
- Fly.io / AWS

---

# Project Structure

```
ai-rag-doc-search/
│
├─ backend/
│ ├─ app/
│ │ ├─ main.py
│ │ ├─ api/
│ │ ├─ rag/
│ │ │ ├─ pipeline.py
│ │ │ ├─ embedding.py
│ │ │ └─ search.py
│ │ ├─ models/
│ │ └─ services/
│
├─ frontend/
│ ├─ pages/
│ ├─ components/
│ └─ services/
│
├─ workers/
│ └─ worker.py
│
├─ docker/
│ └─ Dockerfile
│
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
pip install -r requirements.txt
```

## 3. Run Backend

```
uvicorn app.main:app --reload
```

## 4. Run with Docker

```
docker build -t ai-rag-doc-search .
docker run -p 8080:8080 ai-rag-doc-search
```

---

# Environment Variables

Create a `.env` file:
```
OPENAI_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
DATABASE_URL=
QDRANT_URL=
R2_BUCKET=
```

---

# Background Processing

Document processing tasks may take time:

- PDF parsing
- embedding generation
- vector indexing


Recommended tools:

- Redis
- Celery
- RQ

---

# MVP Scope

1. Initial version should include:
2. User authentication
3. Document upload
4. AI chat with document

---

# Future Improvements

- multi-document search
- team collaboration
- document tagging
- streaming responses
- usage tracking
- subscription billing

---

# Summary

This project demonstrates how to build a scalable AI RAG SaaS platform using modern AI infrastructure.

Key ideas:

- Store files in object storage
- Use vector databases for semantic search
- Use LLMs for answer generation
- Keep metadata in PostgreSQL
- Deploy backend with Docker


