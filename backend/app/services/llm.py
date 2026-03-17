import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_answer(question, context):

    # The prompt + context together determine total token usage.
    # Larger context = higher token cost and slower response.

    prompt = f"""
Use the context below to answer the question.

Context:
{context}

Question:
{question}

Answer:
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt  # Entire prompt (including context) is sent to the LLM and counted as input tokens
            }
        ]
    )

    return response.choices[0].message.content