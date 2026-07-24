from qdrant_client.models import Distance
from qdrant_client.models import VectorParams

from app.core.config import settings
from app.core.qdrant import qdrant_client


def create_collection():

    collections = qdrant_client.get_collections()

    existing = {
        collection.name
        for collection in collections.collections
    }

    if settings.QDRANT_COLLECTION in existing:
        return

    qdrant_client.create_collection(
        collection_name=settings.QDRANT_COLLECTION,
        vectors_config=VectorParams(
            size=settings.QDRANT_VECTOR_SIZE,
            distance=Distance.COSINE,
        ),
    )

    print(
        f"{settings.QDRANT_COLLECTION} collection created."
    )