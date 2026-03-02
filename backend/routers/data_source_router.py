from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import pandas as pd
import os
from uuid import uuid4
from typing import Optional
import sqlite3

router = APIRouter(prefix="/data", tags=["Data Source"])

# =========================================
# CONFIG
# =========================================

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

REQUIRED_CUSTOMER_COLUMNS = [
    "customer_id"
]

REQUIRED_CHURN_COLUMNS = [
    "customer_id",
    "churn"
]

# =========================================
# RESPONSE SCHEMAS
# =========================================

class UploadResponse(BaseModel):
    customer_rows: int
    label_rows: int
    merged_rows: int
    valid_schema: bool
    missing_fields: list[str]
    file_path: Optional[str]


class SyntheticResponse(BaseModel):
    rows: int
    churn_rate: float
    file_path: str


class DBTestResponse(BaseModel):
    success: bool
    message: str


# =========================================
# HELPERS
# =========================================

def check_required_columns(df: pd.DataFrame, required: list[str]) -> list[str]:
    return [c for c in required if c not in df.columns]


# =========================================
# TWO FILE UPLOAD + MERGE
# =========================================

@router.post("/upload-two-files", response_model=UploadResponse)
async def upload_two_files(
    customer_file: UploadFile = File(...),
    churn_file: UploadFile = File(...)
):

    try:
        cust_df = pd.read_csv(customer_file.file)
        churn_df = pd.read_csv(churn_file.file)

        # =========================
        # STRICT LABEL FILE CLEAN
        # =========================

        required = ["customer_id", "churn"]

        missing = [c for c in required if c not in churn_df.columns]
        if missing:
            raise HTTPException(
                400,
                f"Churn file missing columns: {missing}"
            )

        # keep ONLY label columns
        churn_df = churn_df[required]
        merged_df = cust_df.merge(
            churn_df,
            on="customer_id",
            how="inner"
        )

        

    except Exception as e:
        raise HTTPException(400, f"CSV read error: {str(e)}")

    # ---------- schema checks ----------

    missing_customer = check_required_columns(
        cust_df, REQUIRED_CUSTOMER_COLUMNS
    )

    missing_churn = check_required_columns(
        churn_df, REQUIRED_CHURN_COLUMNS
    )

    missing_fields = missing_customer + missing_churn
    valid_schema = len(missing_fields) == 0

    if not valid_schema:
        return UploadResponse(
            customer_rows=len(cust_df),
            label_rows=len(churn_df),
            merged_rows=0,
            valid_schema=False,
            missing_fields=missing_fields,
            file_path=None
        )

    # ---------- merge ----------

    try:

        merged_df = cust_df.merge(
            churn_df,
            on="customer_id",
            how="inner"
        )

    except Exception as e:
        raise HTTPException(400, f"Merge error: {str(e)}")

    if len(merged_df) == 0:
        raise HTTPException(
            400,
            "Merge produced zero rows — check customer_id alignment"
        )

    # ---------- save merged dataset ----------

    file_id = uuid4().hex
    file_path = os.path.join(
        UPLOAD_DIR,
        f"dataset_{file_id}.csv"
    )

    merged_df.to_csv(file_path, index=False)

    # ---------- return ----------

    return UploadResponse(
        customer_rows=len(cust_df),
        label_rows=len(churn_df),
        merged_rows=len(merged_df),
        valid_schema=True,
        missing_fields=[],
        file_path=file_path
    )


# =========================================
# SYNTHETIC DATA GENERATOR
# =========================================

@router.post("/synthetic", response_model=SyntheticResponse)
def generate_synthetic(
    n_customers: int = 1000,
    churn_rate: float = 0.3
):

    if n_customers < 10:
        raise HTTPException(400, "n_customers too small")

    if not 0 < churn_rate < 1:
        raise HTTPException(400, "invalid churn_rate")

    import numpy as np

    df = pd.DataFrame({
        "customer_id": range(1, n_customers + 1),
        "age": np.random.randint(18, 70, n_customers),
        "tenure": np.random.randint(1, 60, n_customers),
        "monthly_charge": np.random.uniform(10, 200, n_customers),
        "plan_type": np.random.choice(
            ["basic", "pro", "enterprise"],
            n_customers
        ),
        "clv": np.random.uniform(100, 5000, n_customers)
    })

    df["churn"] = (
        np.random.rand(n_customers) < churn_rate
    ).astype(int)

    file_id = uuid4().hex
    file_path = os.path.join(
        UPLOAD_DIR,
        f"synthetic_{file_id}.csv"
    )

    df.to_csv(file_path, index=False)

    return SyntheticResponse(
        rows=len(df),
        churn_rate=churn_rate,
        file_path=file_path
    )


# =========================================
# DATABASE CONNECTION TEST
# =========================================

@router.post("/test-db", response_model=DBTestResponse)
def test_db_connection(conn_string: str):

    try:

        # simple sqlite test — replace with your DB engine later
        conn = sqlite3.connect(conn_string)
        conn.execute("SELECT 1")
        conn.close()

        return DBTestResponse(
            success=True,
            message="Connection OK"
        )

    except Exception as e:

        raise HTTPException(
            400,
            f"DB connection failed: {str(e)}"
        )
