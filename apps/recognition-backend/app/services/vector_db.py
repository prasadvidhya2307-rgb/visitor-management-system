from uuid import NAMESPACE_URL, uuid5

from app.core.config import settings
from app.core.qdrant import qdrant_client
from qdrant_client.models import PointStruct


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

    @staticmethod
    def search_embedding(
        embedding: list[float],
    ):

        response = qdrant_client.query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=embedding,
            limit=1,
            with_payload=True,
        )

        return response.points