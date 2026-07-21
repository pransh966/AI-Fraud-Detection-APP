import joblib
import numpy as np
import pandas as pd
import uuid
import os


# Load model and feature list
model = joblib.load("app/ML/fraud_model.pkl")
features = joblib.load("app/ML/features.pkl")

# Load training data
train = pd.read_csv("data/train_transaction.csv")

# Feature mappings
card1_freq = train["card1"].value_counts().to_dict()
card1_count = train.groupby("card1")["TransactionAmt"].count().to_dict()
card1_mean = train.groupby("card1")["TransactionAmt"].mean().to_dict()


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """Prepare input data for prediction."""

    df = df.copy()

    # Feature Engineering
    df["hour"] = (df["TransactionDT"] // 3600) % 24
    df["TransactionAmt_log"] = np.log1p(df["TransactionAmt"])

    df["card1_freq"] = df["card1"].map(card1_freq).fillna(0)
    df["card1_count"] = df["card1"].map(card1_count).fillna(0)
    df["amt_mean_card"] = df["card1"].map(card1_mean).fillna(df["TransactionAmt"])

    # Add missing columns
    for col in features:
        if col not in df.columns:
            df[col] = None

    return df[features]


def predict_transaction(data: dict):
    """Predict whether a transaction is fraudulent."""

    df = pd.DataFrame([data])
    X = prepare_features(df)

    prediction = int(model.predict(X)[0])
    probability = float(model.predict_proba(X)[0][1])

    if probability >= 0.7:
        risk = "High"
    elif probability >= 0.4:
        risk = "Medium"
    else:
        risk = "Low"

    return {
        "prediction": prediction,
        "label": "Fraud" if prediction else "Legitimate",
        "probability": round(probability, 4),
        "risk_level": risk,
    }

def predict_batch_transactions(file):

    # Read uploaded file
    if file.filename.endswith(".csv"):
        df = pd.read_csv(file.file)

    elif file.filename.endswith(".xlsx"):
        df = pd.read_excel(file.file)

    else:
        raise ValueError("Only CSV and Excel files are allowed.")

    # Check if file is empty
    if df.empty:
        raise ValueError("File is empty.")

    # Prepare features
    X = prepare_features(df)

    # Make predictions
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)[:, 1]

    # Add prediction columns
    df["Prediction"] = predictions
    df["Label"] = np.where(predictions == 1, "Fraud", "Legitimate")
    df["Probability"] = probabilities.round(4)

    # Risk Level
    def get_risk(prob):
        if prob >= 0.7:
            return "High"
        elif prob >= 0.4:
            return "Medium"
        else:
            return "Low"

    df["Risk Level"] = df["Probability"].apply(get_risk)

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
        "download_url": f"/predict/download/{filename}"
    }