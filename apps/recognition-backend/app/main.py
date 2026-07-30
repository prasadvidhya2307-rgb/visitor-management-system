from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Routers---
from app.api.routes.health import router as health_router
from app.api.routes.face import router as face_router
from app.api.routes.recognition import router as recognition_router

from app.core.startup import create_collection
from app.core.exceptions import FaceServiceException



@asynccontextmanager
async def lifespan(app: FastAPI):
    create_collection()
    yield


app = FastAPI(
    title="Face Recognition Service",
    version="1.0.0",
    lifespan=lifespan,
)

@app.exception_handler(FaceServiceException)
async def handle_face_exception(
    request: Request,
    exc: FaceServiceException,
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "code": exc.code,
            "message": exc.message,
            "data": None,
        },
    )


app.include_router(health_router)
app.include_router(face_router)
app.include_router(recognition_router)