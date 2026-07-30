from uuid import NAMESPACE_URL, uuid5

from qdrant_client import models
from qdrant_client.models import (
    PointStruct,
    Record,
    ScoredPoint,
)

from app.core.config import settings
from app.core.qdrant import qdrant_client


class VectorDB:
    @staticmethod
    def store_embedding(
        person_id: str,
        embedding: list[float],
    ) -> None:
        """
        Store or update a person's face embedding.
        """

        point_id = str(uuid5(NAMESPACE_URL, person_id))

        qdrant_client.upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=[
                PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={
                        "person_id": person_id,
                    },
                ),
            ],
        )

    @staticmethod
    def search_embedding(
        embedding: list[float],
    ) -> list[ScoredPoint]:
        """
        Search for the closest matching face embedding.
        """

        response = qdrant_client.query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=embedding,
            limit=1,
            with_payload=True,
        )

        return response.points

    @staticmethod
    def get_by_person_id(
        person_id: str,
    ) -> Record | None:
        """
        Retrieve a registered face by person ID.
        """

        points, _ = qdrant_client.scroll(
            collection_name=settings.QDRANT_COLLECTION,
            scroll_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="person_id",
                        match=models.MatchValue(
                            value=person_id,
                        ),
                    ),
                ],
            ),
            limit=1,
            with_payload=True,
        )

        if not points:
            return None

        return points[0]