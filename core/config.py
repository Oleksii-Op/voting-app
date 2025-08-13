from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BaseModel


class RunSettings(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True


class AdminKey(BaseSettings):
    apikey: str


class ApiV1Prefix(BaseModel):
    prefix: str = "/v1"


class ApiPrefix(BaseModel):
    prefix: str = "/api"
    v1: ApiV1Prefix = ApiV1Prefix()


class DatabaseConfig(BaseModel):
    url: str
    echo: bool = True
    echo_pool: bool = False
    pool_size: int = 20
    max_overflow: int = 10


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env.template", ".env"),
        case_sensitive=False,
        env_prefix="CONFIG__",
        env_nested_delimiter="__",
        env_file_encoding="utf-8",
    )
    api: ApiPrefix = ApiPrefix()
    runtime: RunSettings = RunSettings()
    admin: AdminKey
    db: DatabaseConfig


settings = Settings()  # type: ignore
