from fastapi import APIRouter, File, UploadFile
from app.service.faceService import FaceService

router = APIRouter(
    prefix="/face",
    tags=["Face"]
)

@router.post("/register/{employee_id}", status_code=201)
async def registerFace(
    employee_id: str,
    image: UploadFile = File(...)
):
    return await FaceService.register(
        employee_id=employee_id,
        image=image,
    )
