import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://mongo-fastapi:27017")
MONGODB_DB: str = os.getenv("MONGODB_DB", "drivemaster_db")