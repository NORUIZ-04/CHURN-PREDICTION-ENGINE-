# uplift/treatment_schema.py

from dataclasses import dataclass, asdict
from typing import Dict, List, Optional


@dataclass(frozen=True)
class Treatment:
    """
    Represents a retention intervention action.
    Immutable for safety + reproducibility.
    """
    treatment_id: int
    name: str
    description: str
    cost: float
    channel: str
    intensity: str
    expected_delay_days: int = 7
    allowed_segments: Optional[List[str]] = None

    def to_dict(self) -> Dict:
        return asdict(self)


class TreatmentRegistry:
    """
    Central registry of all allowed treatments.
    This becomes the single source of truth
    for uplift + optimizer + simulator + UI.
    """

    def __init__(self):
        self._treatments: Dict[int, Treatment] = {}

    def register(self, treatment: Treatment):
        if treatment.treatment_id in self._treatments:
            raise ValueError(f"Duplicate treatment_id {treatment.treatment_id}")
        self._treatments[treatment.treatment_id] = treatment

    def get(self, treatment_id: int) -> Treatment:
        return self._treatments[treatment_id]

    def list_all(self) -> List[Treatment]:
        return list(self._treatments.values())

    def as_dict(self) -> Dict[int, Dict]:
        return {tid: t.to_dict() for tid, t in self._treatments.items()}

    def validate_id(self, treatment_id: int) -> bool:
        return treatment_id in self._treatments


# ---------- Default Retention Treatment Set ----------

def build_default_treatment_registry() -> TreatmentRegistry:
    reg = TreatmentRegistry()

    reg.register(Treatment(
        treatment_id=0,
        name="no_action",
        description="No retention intervention",
        cost=0.0,
        channel="none",
        intensity="none"
    ))

    reg.register(Treatment(
        treatment_id=1,
        name="discount_offer",
        description="Provide targeted discount",
        cost=20.0,
        channel="pricing",
        intensity="medium"
    ))

    reg.register(Treatment(
        treatment_id=2,
        name="loyalty_bonus",
        description="Grant loyalty points bonus",
        cost=12.0,
        channel="loyalty",
        intensity="low"
    ))

    reg.register(Treatment(
        treatment_id=3,
        name="retention_call",
        description="Personal support call",
        cost=35.0,
        channel="human",
        intensity="high"
    ))

    reg.register(Treatment(
        treatment_id=4,
        name="bundle_upgrade",
        description="Offer bundle upgrade",
        cost=18.0,
        channel="product",
        intensity="medium"
    ))

    return reg
