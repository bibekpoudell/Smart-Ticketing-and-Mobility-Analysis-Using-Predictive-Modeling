from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)
model = joblib.load("price_multiplier_model.pkl")

@app.route("/predict-multiplier", methods=["POST"])
def predict_multiplier():
    data = request.json
    features = np.array([[
        data["occupancy_rate_at_booking"],
        data["days_until_event"],
        data["days_since_created"],
        data["rule_based_multiplier"]
    ]])
    prediction = model.predict(features)[0]
    return jsonify({"predicted_multiplier": round(float(prediction), 2)})

if __name__ == "__main__":
    app.run(port=5001)