from pydantic import BaseModel, ConfigDict


class RecognizeData(BaseModel):
    matched: bool
    personId: str | None
    score: float | None

    model_config = ConfigDict(
        extra="forbid",
    )