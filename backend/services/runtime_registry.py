"""
Central runtime registry for loaded dataset and models.
Prevents circular imports and duplicate loading.
"""

DATAFRAME = None
COUNTERFACTUAL_MODEL = None


def set_dataframe(df):
    global DATAFRAME
    DATAFRAME = df


def get_dataframe():
    if DATAFRAME is None:
        raise RuntimeError("Dataset not loaded")
    return DATAFRAME


def set_counterfactual_model(model):
    global COUNTERFACTUAL_MODEL
    COUNTERFACTUAL_MODEL = model


def get_counterfactual_model():
    if COUNTERFACTUAL_MODEL is None:
        raise RuntimeError("Counterfactual model not initialized")
    return COUNTERFACTUAL_MODEL

