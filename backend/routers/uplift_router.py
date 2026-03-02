from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
import traceback

from config import PROCESSED_DATA_DIR

from services.uplift_model import (
    train_uplift_model,
    predict_uplift,
    load_uplift_model
)

from uplift.evaluation import (
    qini_curve,
    auuc_score,
    qini_coefficient,
    gain_curve
)

router = APIRouter(
    prefix="/uplift",
    tags=["uplift"]
)

# =====================================================
# TRAIN
# =====================================================

@router.post("/train/{filename}")
def train_uplift(filename: str):

    path = PROCESSED_DATA_DIR / filename
    if not path.exists():
        raise HTTPException(404, "file not found")

    df = pd.read_csv(path)
    info = train_uplift_model(df)

    return {
        "message": "uplift model trained",
        "info": info
    }


# =====================================================
# PREDICT
# =====================================================

@router.get("/predict/{filename}")
def uplift_predict(filename: str, limit: int = 50):

    path = PROCESSED_DATA_DIR / filename
    if not path.exists():
        raise HTTPException(404, "file not found")

    df = pd.read_csv(path)

    out = predict_uplift(df)

    out = out.sort_values(
        "uplift_score",
        ascending=False
    ).head(limit)

    return out.to_dict(orient="records")


# =====================================================
# POLICY COMPARE (Research Validation)
# =====================================================

@router.post("/experiment/policy-compare/{filename}")
def compare_policies(filename: str):

    try:

        path = PROCESSED_DATA_DIR / filename
        if not path.exists():
            raise HTTPException(404, "file not found")

        df = pd.read_csv(path)

        bundle = load_uplift_model()
        model_t = bundle["model_t"]
        model_c = bundle["model_c"]
        cols = bundle["feature_cols"]

        treated = 0
        gains = []

        for _, row in df.iterrows():

            row_df = pd.DataFrame([row])

            X = row_df.drop(
                columns=["customer_id", "churn", "time_to_churn", "treatment_flag"],
                errors="ignore"
            )

            X = pd.get_dummies(X, drop_first=True)

            for c in cols:
                if c not in X:
                    X[c] = 0

            X = X[cols]

            p_t = model_t.predict_proba(X)[0,1]
            p_c = model_c.predict_proba(X)[0,1]

            uplift = p_c - p_t

            if uplift > 0:
                treated += 1
                gains.append(uplift)

        avg_uplift = float(np.mean(gains)) if gains else 0.0
        total_gain = float(np.sum(gains)) if gains else 0.0

        return {
            "status": "ok",
            "result": {
                "treated": treated,
                "avg_uplift": avg_uplift,
                "total_gain": total_gain
            },
            "rows": len(df)
        }

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


# =====================================================
# METRICS — QINI / AUUC
# =====================================================

@router.post("/eval/uplift")
def eval_uplift(payload: dict):

    try:
        y = np.array(payload["y"])
        t = np.array(payload["t"])
        u = np.array(payload["uplift"])

        xs, ys = qini_curve(y, t, u)

        return {
            "status": "ok",
            "qini_curve": {
                "x": xs.tolist(),
                "y": ys.tolist()
            },
            "auuc": float(auuc_score(xs, ys)),
            "qini_coef": float(qini_coefficient(xs, ys))
        }

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


@router.post("/eval/gain")
def eval_gain(payload: dict):

    try:
        y = np.array(payload["y"])
        t = np.array(payload["t"])
        u = np.array(payload["uplift"])

        xs, ys = gain_curve(y, t, u)

        return {
            "status": "ok",
            "gain_curve": {
                "x": xs.tolist(),
                "y": ys.tolist()
            }
        }

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@router.post("/optimize/simple")
def optimize_simple(payload: dict):
    """
    Simple budget optimizer using uplift score ranking
    """

    try:
        df = pd.DataFrame(payload["rows"])
        budget = payload["budget"]
        value_col = payload.get("customer_value_col", "CLV")

        out = predict_uplift(df)

        # expected gain = uplift * customer value
        out["expected_gain"] = out["uplift_score"] * out[value_col]

        # assume fixed action cost
        action_cost = payload.get("action_cost", 10)

        out = out.sort_values("expected_gain", ascending=False)

        selected = []
        spend = 0

        for _, r in out.iterrows():
            if spend + action_cost > budget:
                break
            selected.append(r.to_dict())
            spend += action_cost

        return {
            "status": "ok",
            "selected": selected,
            "spend": spend,
            "count": len(selected)
        }

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@router.post("/actions/table")
def uplift_actions_table(payload: dict):

    try:
        df = pd.DataFrame(payload["rows"])

        out = predict_uplift(df)

        out["recommended_action"] = np.where(
            out["uplift_score"] > 0,
            "retain_offer",
            "no_action"
        )

        return {
            "status": "ok",
            "rows": out.to_dict(orient="records")
        }

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@router.post("/evaluate/{filename}")
def evaluate_uplift_file(filename: str):

    try:
        from uplift.evaluation import (
            qini_curve,
            gain_curve,
            auuc_score,
            qini_coefficient
        )
        from services.uplift_model import predict_uplift

        path = PROCESSED_DATA_DIR / filename

        if not path.exists():
            raise HTTPException(404, f"file not found: {path}")

        df = pd.read_csv(path)

        # ===== run uplift model =====
        scored = predict_uplift(df)

        required = ["churn", "treatment_flag", "uplift_score"]
        for c in required:
            if c not in scored.columns:
                raise RuntimeError(f"Missing column: {c}")

        # ✅ FIX — churn → retention
        y = 1 - scored["churn"].values
        t = scored["treatment_flag"].values
        u = scored["uplift_score"].values

        # ===== curves =====
        qx, qy = qini_curve(y, t, u)
        gx, gy = gain_curve(y, t, u)

        auuc = float(auuc_score(qx, qy))
        qini = float(qini_coefficient(qx, qy))

        print("AUUC:", auuc)
        print("QINI:", qini)

        return {
            "status": "ok",
            "metrics": {
                "auuc": auuc,
                "qini": qini
            },
            "qini_curve": {
                "x": qx.tolist(),
                "y": qy.tolist()
            },
            "gain_curve": {
                "x": gx.tolist(),
                "y": gy.tolist()
            },
            "rows": len(df)
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))



@router.post("/eval/deciles/{filename}")
def decile_lift(filename: str):

    try:
        from services.uplift_model import predict_uplift

        path = PROCESSED_DATA_DIR / filename

        if not path.exists():
            raise HTTPException(404, "file not found")

        df = pd.read_csv(path)

        # ===== run uplift model =====
        scored = predict_uplift(df)

        required = {"churn", "treatment_flag", "uplift_score"}
        if not required.issubset(scored.columns):
            raise HTTPException(400, f"Missing columns {required}")

        # ===== prepare columns =====
        scored["response"] = 1 - scored["churn"]

        # sort by uplift desc
        scored = scored.sort_values("uplift_score", ascending=False)

        # create deciles
        scored["decile"] = pd.qcut(
            np.arange(len(scored)),
            10,
            labels=False
        )

        rows = []

        for d in range(10):
            part = scored[scored.decile == d]

            treat = part[part.treatment_flag == 1]
            ctrl  = part[part.treatment_flag == 0]

            if len(treat) == 0 or len(ctrl) == 0:
                continue

            treat_rate = treat.response.mean()
            ctrl_rate  = ctrl.response.mean()

            lift = treat_rate - ctrl_rate
            gain = lift * len(part)

            rows.append({
                "decile": int(d+1),
                "customers": int(len(part)),
                "avg_uplift": float(part.uplift_score.mean()),
                "treat_rate": float(treat_rate),
                "control_rate": float(ctrl_rate),
                "lift": float(lift),
                "gain": float(gain)
            })

        return {
            "status": "ok",
            "deciles": rows
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status":"error","message":str(e)}