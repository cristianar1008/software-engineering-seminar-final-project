from fastapi import APIRouter

from .academico import router as academico_router
from .vehicles import router as vehicles_router

router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "healthy"}

# Incluir subrutas
router.include_router(academico_router)
router.include_router(vehicles_router)