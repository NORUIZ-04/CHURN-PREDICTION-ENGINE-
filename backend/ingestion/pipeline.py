from ingestion.profiling.schema_profiler import profile_schema
from ingestion.mapping.schema_mapper import map_schema
from ingestion.processing.cleaning import clean_data
from ingestion.processing.normalization import normalize_data
from ingestion.processing.feature_engineering import engineer_features
from ingestion.processing.encoding import encode_features
from ingestion.validation.validator import validate_dataset
from ingestion.storage.dataset_registry import store_dataset
from ingestion.utils.logger import get_logger
from scoring.orchestrator import run_scoring_pipeline

logger = get_logger()

def run_ingestion_pipeline(df, config=None):
    logger.info("Starting ingestion pipeline")

    profile = profile_schema(df)

    df = map_schema(df, config)

    df = clean_data(df)

    df = normalize_data(df)

    df = engineer_features(df)

    validation_report = validate_dataset(df)

    df = encode_features(df)

    dataset_path = store_dataset(df)

    # trigger scoring pipeline
    scoring_results = run_scoring_pipeline(dataset_path)

    logger.info("Scoring pipeline completed")

    return {
        "dataset_path": dataset_path,
        "profile": profile,
        "validation": validation_report,
        "scoring_results": scoring_results,
        "columns_after_processing": list(df.columns)
    }