import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend 'app' package is importable when running tests
BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.main import app as fastapi_app


@pytest.fixture
def client():
    return TestClient(fastapi_app)