import os
from dotenv import load_dotenv
from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Load environment variables (for the API key)
load_dotenv()

# 1. Load your FAQ data
loader = CSVLoader(file_path='./faqs.csv', source_column='question')
documents = loader.load()

# 2. Initialize the embedding model (using local model to avoid API quota issues)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 3. Create the Chroma vector store
# This will process the documents, create embeddings, and store them.
vector_store = Chroma.from_documents(documents, embeddings, persist_directory="./chroma_db")

print("Vector store created successfully!")