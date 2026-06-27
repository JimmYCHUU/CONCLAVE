from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    litellm_base_url: str = "http://localhost:4000"
    litellm_api_key: str = "sk-conclave-local"

    google_api_key: str = ""
    gemini_model: str = "gemini/gemini-2.0-flash"
    groq_api_key: str = ""
    groq_model: str = "groq/llama-3.3-70b-versatile"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "ollama/llama3.2:3b"

    database_url: str
    redis_url: str
    chroma_host: str = "localhost"
    chroma_port: int = 8001

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expiry_hours: int = 24

    gnews_api_key: str = ""

    environment: str = "development"

    class Config:
        env_file = "../.env"

settings = Settings()
