from fastapi import APIRouter, UploadFile, File
import shutil
from ingestion.service import ingest_file

router = APIRouter()

@router.post("/ingest")
async def ingest_dataset(file: UploadFile = File(...)):
    file_path = f"temp/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = ingest_file(file_path, config={})

    return result