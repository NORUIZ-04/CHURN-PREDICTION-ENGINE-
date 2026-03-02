from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.data_router import router as data_router
from routers.prep_router import router as prep_router
from routers.model_router import router as model_router
from routers.predict_router import router as predict_router
from routers.explain_router import router as explain_router
from routers.survival_router import router as survival_router
from routers.uplift_router import router as uplift_router
from routers.budget_router import router as budget_router
from routers.decision_router import router as decision_router
from routers.llm_router import router as llm_router
from routers.report_router import router as report_router
from routers.governance_router import router as governance_router
from routers.data_source_router import router as data_source_router
from routers.dataset_overview_router import router as dataset_router
from routers.simulator_router import router as simulator_router
from routers.uplift_router import router as uplift_router
from uplift_policy_validation_api import router as uplift_validation_router
from routers.timetochurn_router import router as timetochurn_router
from routers.insights import router as insights_router
from routers.dashboard_router import router as dashboard_router

app = FastAPI(
    title="Decision Intelligence Backend",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(data_router)
app.include_router(model_router)
app.include_router(predict_router)
app.include_router(explain_router)
app.include_router(survival_router)
app.include_router(uplift_router)
app.include_router(budget_router)
app.include_router(decision_router)
app.include_router(prep_router)
app.include_router(llm_router)
app.include_router(report_router)
app.include_router(governance_router)
app.include_router(data_source_router)
app.include_router(dataset_router)
app.include_router(simulator_router)
app.include_router(uplift_validation_router)
app.include_router(timetochurn_router)
app.include_router(insights_router)
app.include_router(dashboard_router)

@app.get("/")
def health():
    return {"status": "server running"}
