from fastapi import APIRouter, HTTPException

from app.schemas.stream import ResolveRequest, ResolveResponse
from app.services.resolver import StreamResolver

router = APIRouter()


@router.post("/resolve", response_model=ResolveResponse)
async def resolve_url(request: ResolveRequest):
    try:
        result = StreamResolver.resolve(request.url)
        return ResolveResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
