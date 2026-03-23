import pandas as pd
from ingestion.pipeline import run_ingestion_pipeline

def main():
    data = {
        "tenure_months": [5, 12, 24, None],
        "monthly_fee": [50, 60, None, 80],
        "support_calls": [1, 0, 3, 2],
        "contract": ["Monthly", "Annual", "Monthly", "Annual"]
    }

    df = pd.DataFrame(data)

    result = run_ingestion_pipeline(df)

    print("\nDATASET PATH:")
    print(result["dataset_path"])

    print("\nQUALITY REPORT:")
    print(result["validation"])

    print("\nFINAL COLUMNS:")
    print(result["columns_after_processing"])


if __name__ == "__main__":
    main()