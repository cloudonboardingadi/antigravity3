"""FastAPI application entrypoint for the CloudOps Onboarding API."""

from contextlib import asynccontextmanager
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.domains.account_details.router import router as account_details_router
from app.domains.onboarding.router import router as onboarding_router
from app.domains.requirements.router import router as requirements_router
from app.admin.eligibility.router import router as admin_eligibility_router
from app.admin.disclaimer.router import router as admin_disclaimer_router
from app.core.logger import get_logger, setup_logging

setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables."""
    logger.info("Starting up CloudOps API. Initializing database...")
    init_db()
    logger.info("Startup complete.")
    yield  # application runs
    logger.info("Shutting down CloudOps API.")


app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG, lifespan=lifespan)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log details of incoming HTTP requests."""
    req_id = str(uuid.uuid4())
    logger.info(f"[{req_id}] Started {request.method} {request.url.path}")
    start_time = time.perf_counter()
    
    response = await call_next(request)
    
    process_time = time.perf_counter() - start_time
    logger.info(f"[{req_id}] Completed {response.status_code} in {process_time:.4f}s")
    
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Request-ID"] = req_id
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# End-user routers
# ---------------------------------------------------------------------------
app.include_router(onboarding_router, prefix="/api/onboardings", tags=["Onboarding"])
app.include_router(
    account_details_router,
    prefix="/api/account-details",
    tags=["Account Details"],
)
app.include_router(
    requirements_router,
    prefix="/api/requirements",
    tags=["Requirements"],
)

# ---------------------------------------------------------------------------
# Admin routers
# ---------------------------------------------------------------------------
app.include_router(
    admin_eligibility_router,
    prefix="/api/admin/eligibility",
    tags=["Admin - Eligibility"],
)
app.include_router(
    admin_disclaimer_router,
    prefix="/api/admin/disclaimer",
    tags=["Admin - Disclaimer"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/api/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """Simple health-check endpoint."""
    return {"status": "healthy"}
