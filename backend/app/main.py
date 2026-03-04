from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import stream

app = FastAPI(title="Stream Player API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stream.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
