from fastapi import APIRouter, File, UploadFile

from app.services.face_service import FaceService

router = APIRouter(
    prefix="/face",
    tags=["Face"],
)


@router.post("/register/{employee_id}", status_code=201)
async def register_face(
    employee_id: str,
    image: UploadFile = File(...),
):
    return await FaceService.register(
        employee_id=employee_id,
        image=image,
    )