# api/uplift_routes.py

from fastapi import APIRouter
import pandas as pd

from counterfactual.model_store import load_uplift_bundle

router = APIRouter(prefix="/uplift", tags=["uplift"])


@router.post("/counterfactual")
def counterfactual_predict(payload: dict):
    """
    Input: single customer feature dict
    Output: outcome + uplift per treatment
    """

    model = load_uplift_bundle()

    df = pd.DataFrame([payload])

    probs, uplift = model.predict_all_treatments(df)

    return {
        "outcome_probs": {int(k): v.tolist() for k, v in probs.items()},
        "uplift": {int(k): v.tolist() for k, v in uplift.items()},
        "best_treatment": model.predict_best_action(df).tolist()
    }


@router.post("/best-action")
def best_action(payload: dict):
    model = load_uplift_bundle()
    df = pd.DataFrame([payload])
    best = model.predict_best_action(df)

    return {"best_treatment": int(best[0])}
