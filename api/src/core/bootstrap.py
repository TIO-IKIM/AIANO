"""
Application bootstrap and dependency injection setup
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.datastructures import Headers
import logging
import os
from datetime import datetime


from .exceptions import AianoException
from .logging.config import setup_logging


# Initialize before app creation
setup_logging()
logger = logging.getLogger("app")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Startup
        logger.info(
            "App started - Aiano API is running",
            extra={
                "service": "aiano-api",
                "version": "0.1.0",
                "environment": os.getenv("ENVIRONMENT", "development"),
                "cors_origins": os.getenv("CORS_ORIGINS", "*"),
                "allowed_hosts": os.getenv("ALLOWED_HOSTS", "*")
            }
        )
        
        yield
        
        # Shutdown
        logger.info("App shutting down")


    app = FastAPI(
        title="Aiano API",
        description="AI-powered annotation platform API",
        version="1.0.0",
        lifespan=lifespan,
        # Trust proxy headers to maintain HTTPS in redirects
        root_path="",
        swagger_ui_parameters={"syntaxHighlight": False}
    )

    # Add proxy headers middleware to respect X-Forwarded-* headers from Traefik
    # This ensures redirects (like trailing slash) use HTTPS instead of HTTP
    @app.middleware("http")
    async def proxy_headers_middleware(request: Request, call_next):
        # Get X-Forwarded-Proto header
        forwarded_proto = request.headers.get("X-Forwarded-Proto")
        forwarded_host = request.headers.get("X-Forwarded-Host")
        
        if forwarded_proto:
            # Update the request scope to reflect the original protocol
            request.scope["scheme"] = forwarded_proto
        
        if forwarded_host:
            # Update the request scope to reflect the original host
            request.scope["server"] = (forwarded_host, None)
        
        response = await call_next(request)
        return response

    # Add CORS middleware
    cors_origins = os.getenv("CORS_ORIGINS", "*")
    if cors_origins == "*":
        allow_origins = ["*"]
    else:
        allow_origins = [origin.strip() for origin in cors_origins.split(",")]
    
    if os.getenv("ENVIRONMENT") == "production" and "*" in allow_origins:
        logger.warning(
            "⚠️  SECURITY WARNING: CORS is configured to allow ALL origins ('*') in a production environment. "
            "This is insecure. Please specify allowed origins in the CORS_ORIGINS environment variable."
        )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


    # Add trusted host middleware
    allowed_hosts_env = os.getenv("ALLOWED_HOSTS", "*")
    if allowed_hosts_env == "*":
        allowed_hosts = ["*"]
    else:
        allowed_hosts = [host.strip() for host in allowed_hosts_env.split(",") if host.strip()]
        # Always allow localhost for health checks
        allowed_hosts.extend(["localhost", "127.0.0.1"])
    
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=allowed_hosts
    )


    # Global exception handler for AianoException
    @app.exception_handler(AianoException)
    async def aiano_exception_handler(request: Request, exc: AianoException):
        logger.warning(
            f"AianoException: {exc}",
            extra={
                "error_code": exc.__class__.__name__,
                "path": str(request.url.path),
                "method": request.method
            }
        )
        return JSONResponse(
            status_code=400,
            content={
                "detail": str(exc),
                "error_code": exc.__class__.__name__,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        )


    # Global exception handler for unexpected errors
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(
            f"Unhandled exception: {exc}",
            exc_info=True,
            extra={
                "path": str(request.url.path),
                "method": request.method
            }
        )
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        )


    # Include routers
    from ..api.v1.auth_routes import router as auth_router
    from ..api.v1.project_routes import router as project_router
    from ..api.v1.annotation_entry_routes import router as annotation_entry_router
    from ..api.v1.llm_proxy_routes import router as llm_proxy_router
    from ..core.models.settings.routes import router as settings_router
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(project_router, prefix="/api/v1")
    app.include_router(annotation_entry_router, prefix="/api/v1")
    app.include_router(llm_proxy_router, prefix="/api/v1")
    app.include_router(settings_router, prefix="/api/v1")


    @app.get("/")
    async def root():
        return {"message": "Aiano API is running", "version": "0.1.0"}


    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "timestamp": datetime.utcnow().isoformat() + "Z"}


    return app
