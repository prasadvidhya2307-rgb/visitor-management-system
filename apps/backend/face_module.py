import cv2
import numpy as np
import pickle
import struct
import io

_face_analyser = None

def get_face_analyser():
    global _face_analyser
    if _face_analyser is None:
        from insightface.app import FaceAnalysis
        _face_analyser = FaceAnalysis(
            name='buffalo_l',
            providers=['CPUExecutionProvider']
        )
        _face_analyser.prepare(ctx_id=0, det_size=(640, 640))
    return _face_analyser

def extract_face_embedding(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None, None

    app = get_face_analyser()
    faces = app.get(img)
    if not faces:
        return None, None

    face = sorted(faces, key=lambda f: f.bbox[0] - f.bbox[2])[0]
    embedding = face.embedding
    bbox = face.bbox.astype(int).tolist()
    return embedding, bbox

def extract_face_embedding_from_frame(frame):
    app = get_face_analyser()
    faces = app.get(frame)
    if not faces:
        return None, None, []

    face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]))
    embedding = face.embedding
    bbox = face.bbox.astype(int).tolist()
    
    all_bboxes = [f.bbox.astype(int).tolist() for f in faces]
    return embedding, bbox, all_bboxes

def serialize_embedding(embedding):
    return embedding.astype(np.float32).tobytes()

def deserialize_embedding(data):
    return np.frombuffer(data, dtype=np.float32)

def compare_faces(embedding1, embedding2, threshold=0.4):
    embedding1 = embedding1.astype(np.float32)
    embedding2 = embedding2.astype(np.float2)
    norm1 = embedding1 / np.linalg.norm(embedding1)
    norm2 = embedding2 / np.linalg.norm(embedding2)
    similarity = np.dot(norm1, norm2)
    return similarity >= (1 - threshold), float(similarity)

def find_matching_visitor(db_cursor, embedding, threshold=0.4):
    db_cursor.execute("SELECT id, face_embedding FROM visitors WHERE face_embedding IS NOT NULL")
    rows = db_cursor.fetchall()
    
    best_match_id = None
    best_similarity = -1
    
    for visitor_id, face_data in rows:
        stored_embedding = deserialize_embedding(face_data)
        similarity = np.dot(
            embedding / np.linalg.norm(embedding),
            stored_embedding / np.linalg.norm(stored_embedding)
        )
        if similarity > best_similarity:
            best_similarity = similarity
            best_match_id = visitor_id
    
    if best_similarity >= (1 - threshold):
        return best_match_id, best_similarity
    return None, best_similarity
