from fastapi import APIRouter
from app.api.v1.vehicles import router as vehicles_router

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "healthy"}

# Subrutas
router.include_router(vehicles_router)