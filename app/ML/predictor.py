
import joblib
import pandas as pd
import numpy as np

# Load model (Pipeline)
model = joblib.load("app/ML/fraud_model.pkl")
features = joblib.load("app/ML/features.pkl")

# Load training data once
train = pd.read_csv("data/train_transaction.csv")

# Create mappings
card1_freq = train["card1"].value_counts().to_dict()

card1_count = (
    train.groupby("card1")["TransactionAmt"]
    .count()
    .to_dict()
)


def prepare_features(df: pd.DataFrame):
    df = df.copy()

    # Feature Engineering
    df["hour"] = (df["TransactionDT"] // 3600) % 24
    df["TransactionAmt_log"] = np.log1p(df["TransactionAmt"])

    df["card1_freq"] = df["card1"].map(card1_freq).fillna(0)
    df["card1_count"] = df["card1"].map(card1_count).fillna(0)

    # Your saved model expects this column.
    if "amt_mean_card" not in df.columns:
        df["amt_mean_card"] = df["TransactionAmt"]

    # Add any missing columns
    for col in features:
        if col not in df.columns:
            df[col] = None

    df = df[features]

    return df


def predict_transaction(data: dict):
    df = pd.DataFrame([data])

    X = prepare_features(df)

    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0][1]

    return {
        "prediction": int(prediction),
        "probability": float(probability)
    }
