import logging
import joblib
import numpy as np
import pandas as pd
import uuid
import os
import shap

logger = logging.getLogger(__name__)

FRAUD_THRESHOLD = 0.20

model = joblib.load("app/ML/fraud_model.pkl")
features = joblib.load("app/ML/features.pkl")

train = pd.read_csv("data/train_transaction.csv")

card1_freq = train["card1"].value_counts().to_dict()
card1_count = train.groupby("card1")["TransactionAmt"].count().to_dict()
card1_mean = train.groupby("card1")["TransactionAmt"].mean().to_dict()

# SHAP explainability setup
_preprocessor = model.named_steps["preprocessor"]
_classifier = model.named_steps["model"]
_explainer = shap.TreeExplainer(_classifier)
_CATEGORICAL_COLUMNS = list(_preprocessor.transformers_[1][2])


def _build_transformed_column_map(preprocessor) -> list:
    mapping = []

    num_cols = list(preprocessor.transformers_[0][2])
    mapping.extend(num_cols)

    cat_cols = list(preprocessor.transformers_[1][2])
    categories = preprocessor.named_transformers_["cat"].categories_
    for col, cats in zip(cat_cols, categories):
        mapping.extend([col] * len(cats))

    return mapping


_TRANSFORMED_COLUMN_MAP = _build_transformed_column_map(_preprocessor)


_UNIQUE_COLUMNS = []
_seen = set()
for _col in _TRANSFORMED_COLUMN_MAP:
    if _col not in _seen:
        _seen.add(_col)
        _UNIQUE_COLUMNS.append(_col)

_COLUMN_INDICES = {}
for _idx, _col in enumerate(_TRANSFORMED_COLUMN_MAP):
    _COLUMN_INDICES.setdefault(_col, []).append(_idx)


EXPLAINABLE_FEATURES = {
    "TransactionAmt": "Transaction amount",
    "TransactionAmt_log": "Transaction amount (scaled)",
    "hour": "Hour of day",
    "ProductCD": "Product code",
    "card1": "Card issuer ID",
    "card1_freq": "How common this card is",
    "card1_count": "Transaction count for this card",
    "amt_mean_card": "Average spend on this card",
    "card2": "Card ID (card2)",
    "card3": "Card ID (card3)",
    "card4": "Card network",
    "card5": "Card ID (card5)",
    "card6": "Card class (debit/credit)",
    "dist1": "Billing/shipping distance",
    "P_emaildomain": "Purchaser email domain",
    "R_emaildomain": "Recipient email domain",
    "DeviceType": "Device type",
    "DeviceInfo": "Device info",
}



def get_risk_level(probability: float) -> str:
    if probability >= 0.25:
        return "High"
    elif probability >= 0.15:
        return "Medium"
    else:
        return "Low"


def explain_transaction(X: pd.DataFrame, top_n: int = 5) -> list:
    """Return the top features driving this prediction, limited to fields
    the user actually supplied via the Predict form."""
    try:
        X_transformed = _preprocessor.transform(X)
        shap_values = _explainer.shap_values(X_transformed)

        if hasattr(shap_values, "toarray"):
            shap_values = shap_values.toarray()
        shap_row = np.asarray(shap_values)[0]

        contributions = {}
        for value, col in zip(shap_row, _TRANSFORMED_COLUMN_MAP):
            if col not in EXPLAINABLE_FEATURES:
                continue
            contributions[col] = contributions.get(col, 0.0) + float(value)

        ranked = sorted(
            contributions.items(), key=lambda kv: abs(kv[1]), reverse=True
        )[:top_n]

        return [
            {
                "feature": col,
                "label": EXPLAINABLE_FEATURES[col],
                "impact": "increases_risk" if val > 0 else "decreases_risk",
                "weight": round(abs(val), 4),
            }
            for col, val in ranked
            if abs(val) > 1e-6
        ]
    except Exception:
        logger.exception("explain_transaction failed")
        return []



def explain_batch(X: pd.DataFrame, top_n_per_row: int = 3, top_n_overall: int = 5):
    try:
        X_transformed = _preprocessor.transform(X)
        shap_values = _explainer.shap_values(X_transformed)

        if hasattr(shap_values, "toarray"):
            shap_values = shap_values.toarray()
        shap_values = np.asarray(shap_values)

        agg = np.zeros((shap_values.shape[0], len(_UNIQUE_COLUMNS)))
        for j, col in enumerate(_UNIQUE_COLUMNS):
            agg[:, j] = shap_values[:, _COLUMN_INDICES[col]].sum(axis=1)

        # Which original columns were actually provided (non-null, and not
        # our "missing" categorical placeholder) in X, per row.
        provided = np.zeros((X.shape[0], len(_UNIQUE_COLUMNS)), dtype=bool)
        for j, col in enumerate(_UNIQUE_COLUMNS):
            if col not in X.columns:
                continue
            col_values = X[col]
            not_null = col_values.notna().to_numpy()
            if col in _CATEGORICAL_COLUMNS:
                not_placeholder = (col_values.astype(str) != "missing").to_numpy()
                provided[:, j] = not_null & not_placeholder
            else:
                provided[:, j] = not_null

        masked = agg * provided

        per_row_summaries = []
        for i in range(masked.shape[0]):
            row = masked[i]
            order = np.argsort(-np.abs(row))[:top_n_per_row]
            parts = []
            for idx in order:
                if abs(row[idx]) < 1e-6:
                    continue
                label = EXPLAINABLE_FEATURES.get(_UNIQUE_COLUMNS[idx], _UNIQUE_COLUMNS[idx])
                arrow = "↑" if row[idx] > 0 else "↓"
                parts.append(f"{label} {arrow}")
            per_row_summaries.append(", ".join(parts) if parts else "—")

        counts = provided.sum(axis=0)
        counts_safe = np.maximum(counts, 1)
        mean_signed = masked.sum(axis=0) / counts_safe
        mean_abs = np.abs(masked).sum(axis=0) / counts_safe

        order_overall = np.argsort(-mean_abs)[:top_n_overall]
        aggregate = [
            {
                "feature": _UNIQUE_COLUMNS[idx],
                "label": EXPLAINABLE_FEATURES.get(_UNIQUE_COLUMNS[idx], _UNIQUE_COLUMNS[idx]),
                "impact": "increases_risk" if mean_signed[idx] > 0 else "decreases_risk",
                "weight": round(float(mean_abs[idx]), 4),
            }
            for idx in order_overall
            if counts[idx] > 0 and mean_abs[idx] > 1e-6
        ]

        return per_row_summaries, aggregate
    except Exception:
        logger.exception("explain_batch failed")
        return ["—"] * len(X), []


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """Prepare input data for prediction."""

    df = df.copy()

    # Feature Engineering
    df["hour"] = (df["TransactionDT"] // 3600) % 24
    df["TransactionAmt_log"] = np.log1p(df["TransactionAmt"])

    # card1 may be missing entirely from a single-prediction payload (the
    # Predict form doesn't require every field). Previously this raised a
    # bare KeyError; now it degrades gracefully to "no card1 info available".
    if "card1" in df.columns:
        df["card1_freq"] = df["card1"].map(card1_freq).fillna(0)
        df["card1_count"] = df["card1"].map(card1_count).fillna(0)
        df["amt_mean_card"] = df["card1"].map(card1_mean).fillna(df["TransactionAmt"])
    else:
        df["card1_freq"] = 0
        df["card1_count"] = 0
        df["amt_mean_card"] = df["TransactionAmt"]

    # Add missing columns
    for col in features:
        if col not in df.columns:
            df[col] = None

    df[_CATEGORICAL_COLUMNS] = (
        df[_CATEGORICAL_COLUMNS]
        .astype(str)
        .replace({"nan": "missing", "None": "missing", "": "missing"})
    )

    return df[features]


def predict_transaction(data: dict):
    """Predict whether a transaction is fraudulent."""

    df = pd.DataFrame([data])
    X = prepare_features(df)

    probability = float(model.predict_proba(X)[0][1])
    prediction = int(probability >= FRAUD_THRESHOLD)

    return {
        "prediction": prediction,
        "label": "Fraud" if prediction else "Legitimate",
        "probability": round(probability, 4),
        "risk_level": get_risk_level(probability),
        "top_factors": explain_transaction(X),
    }


def predict_batch_transactions(file):

    # Read uploaded file
    if file.filename.endswith(".csv"):
        df = pd.read_csv(file.file)

    elif file.filename.endswith(".xlsx"):
        df = pd.read_excel(file.file)

    else:
        raise ValueError("Only CSV and Excel files are allowed.")

    if df.empty:
        raise ValueError("File is empty.")

    X = prepare_features(df)

    probabilities = model.predict_proba(X)[:, 1]
    predictions = (probabilities >= FRAUD_THRESHOLD).astype(int)

    per_row_summaries, batch_top_factors = explain_batch(X)

    df["Prediction"] = predictions
    df["Label"] = np.where(predictions == 1, "Fraud", "Legitimate")
    df["Probability"] = probabilities.round(4)
    df["Top Factors"] = per_row_summaries
    df["Risk Level"] = df["Probability"].apply(get_risk_level)

    # Create output folder
    os.makedirs("outputs", exist_ok=True)

    # Save file
    filename = f"{uuid.uuid4().hex}.xlsx"
    output_path = os.path.join("outputs", filename)

    df.to_excel(output_path, index=False)

    # Calculate summary
    total = len(df)
    fraud = int(df["Prediction"].sum())
    legitimate = total - fraud
    average_probability = round(float(df["Probability"].mean()), 4)

    return {
        "batch_id": uuid.uuid4().hex[:8],
        "message": "Batch prediction completed successfully.",
        "total_transactions": total,
        "fraud_transactions": fraud,
        "legitimate_transactions": legitimate,
        "average_fraud_probability": average_probability,
        "output_file": filename,
        "download_url": f"/predict/download/{filename}",
        "top_factors": batch_top_factors,
    }
