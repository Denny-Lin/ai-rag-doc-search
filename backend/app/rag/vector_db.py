import chromadb
from chromadb.config import Settings

client = chromadb.Client(Settings(persist_directory="chroma"))

collection = client.get_or_create_collection(name="documents")


def store_embeddings(chunks, embeddings):
    ids = [str(i) for i in range(len(chunks))]

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids
    )


def search(query_embedding, top_k=3):
    # top_k controls how many chunks are retrieved for answering.
    # Increasing top_k increases the size of context sent to the LLM,
    # which directly increases token usage and cost.

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results["documents"][0]