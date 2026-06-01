"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    DATABASE_URL: str = "postgresql://postgres:p%40ssw0rd@localhost:5433/conb1"
    APP_NAME: str = "CloudOps Onboarding API"
    DEBUG: bool = False

    model_config = {"env_file": ".env"}


settings = Settings()
