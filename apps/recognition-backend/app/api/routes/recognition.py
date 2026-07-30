from fastapi import APIRouter, File, UploadFile
from app.services.face_service import FaceService
from app.schemas.recognition import RecognizeData
from app.schemas.response import ApiResponse

router = APIRouter(
    prefix="/face",
    tags=["Recognition"],
)


@router.post(
    "/recognize",
    response_model=ApiResponse[RecognizeData],
)
async def recognize_face(
    image: UploadFile = File(...),
):
    return await FaceService.recognize(image)