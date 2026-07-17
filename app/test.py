import pandas as pd
import requests
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)

# Load test dataset
df = pd.read_csv("data/test_transaction.csv")

# Save actual labels
y_true = df["isFraud"]

# Remove target column
X = df.drop(columns=["isFraud"])

# Your JWT token
TOKEN = "PASTE_YOUR_TOKEN_HERE"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

predictions = []

print("Testing API...")

for _, row in X.iterrows():
    payload = row.to_dict()

    response = requests.post(
        "http://127.0.0.1:8000/predict/",
        headers=headers,
        json=payload
    )

    if response.status_code == 200:
        predictions.append(response.json()["prediction"])
    else:
        print("Error:", response.status_code)
        predictions.append(0)

print("\nEvaluation Results")
print("------------------")

print("Accuracy :", accuracy_score(y_true, predictions))
print("Precision:", precision_score(y_true, predictions))
print("Recall   :", recall_score(y_true, predictions))
print("F1 Score :", f1_score(y_true, predictions))

print("\nConfusion Matrix")

print(confusion_matrix(y_true, predictions))