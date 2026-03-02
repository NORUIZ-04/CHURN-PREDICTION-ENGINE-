from fastapi import APIRouter, HTTPException, Body, Query
import pandas as pd

from config import PROCESSED_DATA_DIR
from services.explainer import explain_dataframe,global_importance_for_df

from services.predictor import predict_dataframe,prepare_features
from services.shap_cache import file_hash, load_cache, save_cache

from services.feature_engineering import apply_feature_pipeline
from services.llm_explainer import (explain_shap_row_llm,recommend_retention_action)
from services.action_simulator import simulate_actions



router = APIRouter(
    prefix="/explain",
    tags=["explain"]
)
DATA_PATH = "data/processed/processed_synthetic_12000.csv"

# -----------------------------------
# Explain file customers
# -----------------------------------
# =========================================
# Explain file with SHAP cache
# =========================================
@router.get("/test-id")
def test_id(customer_id: int):
    df = pd.read_csv(DATA_PATH)
    return df[df.customer_id == customer_id].to_dict()

@router.get("/file/{filename}")
def explain_file(filename: str, top_k: int = 5, limit: int = 50):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "File not found")

    # =====================
    # CACHE CHECK
    # =====================

    h = file_hash(path)

    cached = load_cache(h, limit, top_k)

    if cached:
        return cached

    # =====================
    # COMPUTE
    # =====================

    df = pd.read_csv(path)

    preds = predict_dataframe(df)

    preds = preds.sort_values(
        "churn_probability",
        ascending=False
    ).head(limit)

    explanations = explain_dataframe(preds, top_k)

    output = []

    for i in range(len(preds)):

        output.append({
            "customer_id": int(preds.iloc[i].get("customer_id", i)),
            "churn_probability": float(preds.iloc[i]["churn_probability"]),
            "prediction": int(preds.iloc[i]["churn_prediction"]),
            "top_drivers": explanations[i]
        })

    # =====================
    # SAVE CACHE
    # =====================

    save_cache(h, limit, top_k, output)

    return output

@router.post("/single")
def explain_single(
    customer_id: int = Query(...),
    top_k: int = Query(3)
):
    """
    Explain a single customer by ID using real dataset row
    """

    try:

        # ---------- load dataset ----------
        df = pd.read_csv(DATA_PATH)

        if "customer_id" not in df.columns:
            return {"error": "customer_id column not found in dataset"}

        row = df[df["customer_id"] == customer_id]

        if row.empty:
            return {"error": f"customer_id {customer_id} not found"}

        # ---------- feature engineering ----------
        df_feat = apply_feature_pipeline(row.copy())

        # ---------- prediction ----------
        pred_df = predict_dataframe(df_feat)

        # ---------- shap ----------
        exp = explain_dataframe(df_feat, top_k=top_k)[0]

        # ---- llm ----
        llm_text = explain_shap_row_llm(
                customer_id,
                exp,
                int(pred_df["churn_prediction"].iloc[0]),
                float(pred_df["churn_probability"].iloc[0])
            )
        
        #------ retention action recommendation ------
        action_text = recommend_retention_action(
                customer_id,
                exp,
                int(pred_df["churn_prediction"].iloc[0]),
                float(pred_df["churn_probability"].iloc[0])
            )
        
        return {
            "prediction": int(pred_df["churn_prediction"].iloc[0]),
            "probability": float(pred_df["churn_probability"].iloc[0]),
            "explanation": exp,
            "llm_explanation": llm_text,
            "retention_action": action_text
        }

    except Exception as e:
        print("EXPLAIN ERROR:", e)
        return {"error": str(e)}

@router.get("/global/{filename}")
def global_importance(filename: str, limit: int = 20):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "file not found")

    df = pd.read_csv(path)

    result = global_importance_for_df(df, limit)

    return {
        "features": result
    }

@router.get("/global")
def global_shap(path: str, top_k: int = 20):
    path = PROCESSED_DATA_DIR / path
    df = pd.read_csv(path)

    feats = global_importance_for_df(df, top_k)

    return {
        "features": feats
    }



@router.post("/simulate")
def simulate(payload: dict):

    row = payload.get("row")
    actions = payload.get("actions", {})

    return simulate_actions(row, actions)
