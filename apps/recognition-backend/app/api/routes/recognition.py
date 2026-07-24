from fastapi import APIRouter, File, UploadFile
from app.services.face_service import FaceService

router = APIRouter(
    prefix="/face",
    tags=["Recognition"],
)


@router.post("/recognize")
async def recognize_face(
    image: UploadFile = File(...),
):
    return await FaceService.recognize(image)