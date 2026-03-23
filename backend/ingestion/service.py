from ingestion.pipeline import run_ingestion_pipeline
from ingestion.readers.csv_reader import read_csv
from ingestion.readers.excel_reader import read_excel
from ingestion.readers.json_reader import read_json

def ingest_file(file_path: str, config: dict):
    if file_path.endswith(".csv"):
        df = read_csv(file_path)
    elif file_path.endswith(".xlsx"):
        df = read_excel(file_path)
    elif file_path.endswith(".json"):
        df = read_json(file_path)
    else:
        raise ValueError("Unsupported file type")

    return run_ingestion_pipeline(df, config)