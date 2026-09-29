from backend.ai.rag_pipeline import rag_pipeline

class RAGService:
    @staticmethod
    def ask_assistant(db, query: str, user_id: int = None, language: str = None):
        return rag_pipeline.process_query(db, query, user_id=user_id, language_override=language)

rag_service = RAGService()
