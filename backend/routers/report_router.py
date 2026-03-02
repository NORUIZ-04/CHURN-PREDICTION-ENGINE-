from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import pandas as pd

from config import PROCESSED_DATA_DIR
from services.decision_engine import build_decisions
from services.llm_explainer import explain_decisions_llm
from services.report_generator import generate_executive_report

router = APIRouter(
    prefix="/report",
    tags=["report"]
)


@router.get("/executive/{filename}")
def executive_report(
    filename: str,
    budget: float = 5000
):

    path = PROCESSED_DATA_DIR / filename

    if not path.exists():
        raise HTTPException(404, "file not found")

    df = pd.read_csv(path)

    decisions = build_decisions(df, budget)

    records = decisions.to_dict(orient="records")

    explained = explain_decisions_llm(records, limit=5)

    dec_df = pd.DataFrame(explained)

    pdf_path = generate_executive_report(
        dec_df,
        filename
    )

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=pdf_path.name
    )
