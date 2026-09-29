import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("finsaarthi.chroma")

CHROMA_PERSIST_DIRECTORY = os.getenv("CHROMA_PERSIST_DIRECTORY", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "chroma_db")))
CHROMA_HOST = os.getenv("CHROMA_HOST", None)
CHROMA_PORT = int(os.getenv("CHROMA_PORT", 8000))

class MockChromaCollection:
    """In-memory vector collection fallback."""
    def __init__(self, name: str):
        self.name = name
        self.documents = []
        self.metadatas = []
        self.ids = []
        self.embeddings = []

    def upsert(self, ids: List[str], embeddings: List[List[float]], documents: List[str], metadatas: List[Dict[str, Any]]):
        for i, doc_id in enumerate(ids):
            if doc_id in self.ids:
                idx = self.ids.index(doc_id)
                self.embeddings[idx] = embeddings[i]
                self.documents[idx] = documents[i]
                self.metadatas[idx] = metadatas[i]
            else:
                self.ids.append(doc_id)
                self.embeddings.append(embeddings[i])
                self.documents.append(documents[i])
                self.metadatas.append(metadatas[i])

    def query(self, query_embeddings: List[List[float]], n_results: int = 5, where: Optional[Dict[str, Any]] = None):
        import numpy as np
        if not self.embeddings:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

        query_vec = np.array(query_embeddings[0])
        sims = []
        for i, emb in enumerate(self.embeddings):
            # Apply basic where filter if present
            if where:
                match = True
                for k, v in where.items():
                    if self.metadatas[i].get(k) != v:
                        match = False
                        break
                if not match:
                    continue

            emb_vec = np.array(emb)
            dot = np.dot(query_vec, emb_vec)
            norm = (np.linalg.norm(query_vec) * np.linalg.norm(emb_vec)) + 1e-9
            sim = float(dot / norm)
            distance = 1.0 - sim
            sims.append((distance, self.ids[i], self.documents[i], self.metadatas[i]))

        sims.sort(key=lambda x: x[0])
        top_k = sims[:n_results]

        return {
            "ids": [[item[1] for item in top_k]],
            "documents": [[item[2] for item in top_k]],
            "metadatas": [[item[3] for item in top_k]],
            "distances": [[item[0] for item in top_k]]
        }

    def count(self) -> int:
        return len(self.ids)

class MockChromaClient:
    def __init__(self):
        self._collections = {}
        logger.info("Using Fallback In-Memory Vector Store")

    def get_or_create_collection(self, name: str, **kwargs):
        if name not in self._collections:
            self._collections[name] = MockChromaCollection(name)
        return self._collections[name]

def get_chroma_client():
    try:
        import chromadb
        os.makedirs(CHROMA_PERSIST_DIRECTORY, exist_ok=True)
        if CHROMA_HOST:
            logger.info("Connecting to ChromaDB HTTP at %s:%s", CHROMA_HOST, CHROMA_PORT)
            return chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
        else:
            logger.info("Connecting to ChromaDB PersistentClient at %s", CHROMA_PERSIST_DIRECTORY)
            return chromadb.PersistentClient(path=CHROMA_PERSIST_DIRECTORY)
    except Exception as e:
        logger.warning("ChromaDB initialization failed (%s). Using fallback vector client.", e)
        return MockChromaClient()

chroma_client = get_chroma_client()
schemes_collection = chroma_client.get_or_create_collection(name="government_schemes")
