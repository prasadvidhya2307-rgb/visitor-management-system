from uuid import uuid5, NAMESPACE_URL

from qdrant_client.models import PointStruct

from app.core.config import settings
from app.core.qdrant import qdrant_client


class VectorDB:

    @staticmethod
    def store_embedding(
        employee_id: str,
        embedding: list[float],
    ) -> None:

        point_id = str(uuid5(NAMESPACE_URL, employee_id))

        qdrant_client.upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=[
                PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={
                        "employee_id": employee_id,
                    },
                ),
            ],
        )