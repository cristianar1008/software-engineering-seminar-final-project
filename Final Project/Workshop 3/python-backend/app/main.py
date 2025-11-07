import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes import router as api_router
from app.db.mongo import init_indexes, get_client

app = FastAPI(title="Seminar Project API", version="0.1.0")

# CORS para frontend Angular en localhost:4200
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:4201",
        "http://127.0.0.1:4201",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API running"}

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def on_startup():
    try:
        await init_indexes()
    except Exception as e:
        logging.getLogger(__name__).warning(f"No se pudieron crear índices MongoDB: {e}")


@app.on_event("shutdown")
async def on_shutdown():
    client = get_client()
    if client:
        client.close()