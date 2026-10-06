from dataclasses import dataclass
import os

@dataclass(frozen=True)
class Settings:
    app_name: str = "Cyro"
    model: str = ""
    data_dir: str = os.getenv("CYRO_DATA_DIR", ".cyro")

settings = Settings()
