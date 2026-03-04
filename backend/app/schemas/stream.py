from pydantic import BaseModel


class ResolveRequest(BaseModel):
    url: str


class ResolveResponse(BaseModel):
    url: str
    title: str
    duration: float | None = None
    video_id: str | None = None
