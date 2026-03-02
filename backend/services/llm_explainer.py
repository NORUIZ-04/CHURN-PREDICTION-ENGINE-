import os
from groq import Groq


client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

if not os.getenv("GROQ_API_KEY"):
    raise RuntimeError("GROQ_API_KEY not found in environment")

MODEL_NAME = "llama-3.1-8b-instant"
# you can switch to mixtral or other groq models later


def build_explanation_prompt(row):

    drivers = row.get("drivers", [])

    driver_text = ", ".join(
        f'{d["feature"]} ({d["impact"]:.2f})'
        for d in drivers
    )

    return f"""
You are a telecom customer retention analyst.

Explain this churn decision in simple business language.

Risk score: {row['risk']:.2f}
Time to churn: {row['time_to_churn']:.1f} months
Uplift score: {row['uplift']:.2f}
ROI: {row['roi']:.2f}
Recommended action: {row['recommended_action']}

Top churn drivers:
{driver_text}

Write:
- short explanation
- why customer is risky
- why action helps
- expected business impact

Keep under 120 words.
"""


def groq_explain(prompt):

    resp = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=260
    )

    return resp.choices[0].message.content


def explain_decisions_llm(records, limit=5):

    outputs = []

    for row in records[:limit]:

        prompt = build_explanation_prompt(row)

        try:
            text = groq_explain(prompt)
        except Exception as e:
            text = f"LLM error: {str(e)}"

        row["llm_explanation"] = text

        outputs.append(row)

    return outputs

def build_shap_row_prompt(row, shap_items, prediction, prob):

    driver_text = ", ".join(
        f'{d["feature"]} ({d["impact"]:.3f})'
        for d in shap_items
    )

    return f"""
You are a churn model analyst.

Explain this churn prediction in simple business terms.

Prediction: {prediction}
Probability: {prob:.3f}

Customer data:
{row}

Top SHAP drivers:
{driver_text}

Write:
- why the model predicts this risk
- which factors increase churn
- which reduce churn
- business-friendly language
- under 120 words
"""
def explain_shap_row_llm(row, shap_items, prediction, prob):

    prompt = build_shap_row_prompt(
        row,
        shap_items,
        prediction,
        prob
    )

    try:
        return groq_explain(prompt)
    except Exception as e:
        return f"LLM error: {str(e)}"

#===============================Prompt for retention recommendation===============================
def build_retention_prompt(row, shap_items, prediction, prob):

    driver_text = ", ".join(
        f'{d["feature"]} ({d["impact"]:.3f})'
        for d in shap_items
    )

    return f"""
You are a telecom retention strategist.

Customer churn prediction: {prediction}
Risk probability: {prob:.3f}

Customer features:
{row}

Top churn drivers:
{driver_text}

Recommend ONE best retention action.

Choose from:
- discount offer
- plan upgrade
- support callback
- loyalty reward
- contract extension
- engagement campaign

Return JSON with:
action
reason
expected_effect
priority (LOW/MEDIUM/HIGH)

Keep it short and practical.
"""
# =============== groq Structured Call ===============
import json

def groq_retention(prompt):

    resp = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=260
    )

    text = resp.choices[0].message.content

    try:
        return json.loads(text)
    except:
        return {
            "action": "manual_review",
            "reason": text,
            "expected_effect": "unknown",
            "priority": "MEDIUM"
        }

#=====================Wrapper function======================

def recommend_retention_action(row, shap_items, prediction, prob):

    prompt = build_retention_prompt(
        row,
        shap_items,
        prediction,
        prob
    )

    return groq_retention(prompt)

# ================= UPLIFT STRATEGY NARRATIVE =================

def build_uplift_strategy_prompt(
    row,
    treatment_name,
    uplift,
    gain,
    roi,
    cost,
    drivers
):

    driver_text = ", ".join(
        f"{f} ({v:.3f})"
        for f, v in drivers[:5]
    )

    return f"""
You are a senior customer retention strategist.

Explain this uplift-driven retention decision.

Customer:
{row}

Recommended action: {treatment_name}
Predicted uplift: {uplift:.3f}
Action cost: {cost:.2f}
Expected net gain: {gain:.2f}
ROI: {roi:.2f}

Top uplift drivers:
{driver_text}

Write:
- why this action is chosen
- what customer signals support it
- expected business impact
- any uncertainty note

Keep under 140 words.
Use business language.
"""

def explain_uplift_strategy_llm(
    row,
    treatment_name,
    uplift,
    gain,
    roi,
    cost,
    drivers
):

    prompt = build_uplift_strategy_prompt(
        row,
        treatment_name,
        uplift,
        gain,
        roi,
        cost,
        drivers
    )

    try:
        return groq_explain(prompt)
    except Exception as e:
        return f"LLM error: {str(e)}"
