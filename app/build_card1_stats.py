import pandas as pd
import joblib

train = pd.read_csv("data/train_transaction.csv")

card1_stats = {
    "card1_freq": train["card1"].value_counts().to_dict(),
    "card1_count": train.groupby("card1")["TransactionAmt"].count().to_dict(),
    "card1_mean": train.groupby("card1")["TransactionAmt"].mean().to_dict(),
}

joblib.dump(card1_stats, "app/ML/card1_stats.pkl")
print("saved app/ML/card1_stats.pkl")