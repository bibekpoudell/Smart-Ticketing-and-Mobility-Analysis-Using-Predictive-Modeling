import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib

# Load dataset
data = pd.read_csv("ticket_pricing_hybrid_dataset_20000.csv")
print("Dataset loaded:", data.shape)

# Features and target
X = data[[
    "occupancy_rate_at_booking",
    "days_until_event",
    "days_since_created",
    "rule_based_multiplier"
]]
y = data["final_multiplier"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Accuracy
score = model.score(X_test, y_test)
print("Model Accuracy (R^2):", score)

# Save model
joblib.dump(model, "price_multiplier_model.pkl")
print("Model saved as price_multiplier_model.pkl")