def chunk_text(text: str, chunk_size=300, overlap=50):
    # Smaller chunk_size reduces the amount of text sent to the LLM,
    # which helps lower token usage during inference.

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size

        # Extract a chunk of text with controlled size
        chunk = text[start:end]
        chunks.append(chunk)

        # Move the window forward with overlap to preserve context continuity
        # Overlap helps avoid cutting important semantic information
        start += chunk_size - overlap

    return chunks