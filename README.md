# Stream Player Web

YouTube等のストリーミング動画にマーカー・セグメントを設定し、ループ再生・テンポ/ピッチ制御を行うWebアプリケーション。

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Python 3.12 + FastAPI |
| Video | YouTube IFrame Player API |
| Audio FX | Web Audio API |
| Persistence | Browser localStorage |
| Testing | Vitest + React Testing Library (FE) / pytest (BE) |
| CI/CD | GitHub Actions |
| Container | Docker + docker-compose |

## Quick Start

### Docker (Recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Local Development

**Backend:**
```bash
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Testing

```bash
# Backend
cd backend && pytest -v

# Frontend
cd frontend && npm test
```

## Project Structure

```
stream-player-web/
├── frontend/          # React + TypeScript (Vite)
├── backend/           # Python FastAPI
├── docker-compose.yml
├── .github/workflows/ # CI/CD
└── docs/              # Requirements & User Stories
```
