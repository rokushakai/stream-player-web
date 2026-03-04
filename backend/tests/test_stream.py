from unittest.mock import patch

import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_resolve_url_success(client):
    mock_result = {
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "title": "Test Video",
        "duration": 212.0,
        "video_id": "dQw4w9WgXcQ",
    }
    with patch("app.routers.stream.StreamResolver.resolve", return_value=mock_result):
        response = await client.post(
            "/api/resolve",
            json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Video"
        assert data["video_id"] == "dQw4w9WgXcQ"


@pytest.mark.asyncio
async def test_resolve_url_invalid(client):
    with patch(
        "app.routers.stream.StreamResolver.resolve",
        side_effect=ValueError("Could not resolve"),
    ):
        response = await client.post(
            "/api/resolve",
            json={"url": "invalid-url"},
        )
        assert response.status_code == 400
