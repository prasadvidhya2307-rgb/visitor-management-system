from pydantic import BaseModel, ConfigDict

class RegisterData(BaseModel):
    personId: str

    model_config = ConfigDict(
        extra="forbid",
    )