from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

from pathlib import Path
import pandas as pd


REPORT_DIR = Path("reports")
REPORT_DIR.mkdir(exist_ok=True)


def generate_executive_report(
    decisions: pd.DataFrame,
    filename: str
):

    path = REPORT_DIR / f"executive_report_{filename}.pdf"

    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4
    )

    styles = getSampleStyleSheet()
    story = []

    # -------- title --------
    story.append(
        Paragraph(
            "AI Customer Retention Executive Report",
            styles["Title"]
        )
    )

    story.append(Spacer(1, 12))

    # -------- summary --------
    total = len(decisions)
    avg_risk = decisions["risk"].mean()
    avg_roi = decisions["roi"].mean()

    story.append(
        Paragraph(
            f"""
            Total Target Customers: {total}<br/>
            Average Churn Risk: {avg_risk:.2f}<br/>
            Average ROI: {avg_roi:.2f}
            """,
            styles["Normal"]
        )
    )

    story.append(Spacer(1, 16))

    # -------- top table --------
    story.append(
        Paragraph(
            "Top Retention Targets",
            styles["Heading2"]
        )
    )

    table_data = [["Customer", "Risk", "ROI", "Action", "Urgency"]]

    for _, r in decisions.head(10).iterrows():
        table_data.append([
            int(r["customer_id"]),
            f"{r['risk']:.2f}",
            f"{r['roi']:.1f}",
            r["recommended_action"],
            r["urgency"]
        ])

    table = Table(table_data)

    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.grey),
        ("TEXTCOLOR", (0,0), (-1,0), colors.whitesmoke),
        ("GRID", (0,0), (-1,-1), 1, colors.black),
        ("ALIGN", (1,1), (-1,-1), "CENTER")
    ]))

    story.append(table)
    story.append(Spacer(1, 18))

    # -------- LLM explanations --------
    story.append(
        Paragraph(
            "AI Decision Explanations",
            styles["Heading2"]
        )
    )

    for _, r in decisions.head(5).iterrows():

        text = r.get("llm_explanation", "")

        story.append(
            Paragraph(
                f"<b>Customer {int(r['customer_id'])}</b>",
                styles["Heading3"]
            )
        )

        story.append(
            Paragraph(text, styles["Normal"])
        )

        story.append(Spacer(1, 10))

    doc.build(story)

    return path
