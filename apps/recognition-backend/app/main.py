from fastapi import FastAPI

from app.api.routes.health import router as health_router
# from app.api.routes.face import router as face_router
# from app.api.routes.recognition import router as recognition_router

app = FastAPI(
    title="Face Recognition Service",
    version="1.0.0"
)

app.include_router(health_router)
# app.include_router(face_router)
# app.include_router(recognition_router)