from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from claude_schedule.settings import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Claude Schedule - GitHub Issue Lifecycle Demo")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.get("/api/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    from claude_schedule.api.errors import register_exception_handlers
    from claude_schedule.api.routes import router as api_router

    register_exception_handlers(app)
    app.include_router(api_router)

    return app


app = create_app()
