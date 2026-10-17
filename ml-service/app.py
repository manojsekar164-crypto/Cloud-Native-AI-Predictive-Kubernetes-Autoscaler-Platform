import os
import sys
from flask import Flask, request, jsonify

# Ensure UTF-8 output encoding to avoid charmap encoding errors
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

try:
    from flask_cors import CORS
except ImportError:
    CORS = None

app = Flask(__name__)

if CORS is not None:
    CORS(app)
else:
    @app.after_request
    def apply_cors(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        return response


# -----------------------------
# Health Check
# -----------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "ML Service Running",
        "status": "active"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "Healthy",
        "service": "ML Service",
        "port": int(os.environ.get("PORT", 5000))
    }), 200


# -----------------------------
# Prediction API
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:

        data = request.get_json()

        # Support both payload formats
        loads = data.get("cpu_history")

        if loads is None:
            loads = data.get("loads", [])

        if len(loads) < 3:
            return jsonify({
                "success": False,
                "error": "Need at least 3 CPU values"
            }), 400

        n = len(loads)

        x = list(range(n))

        x_mean = sum(x) / n
        y_mean = sum(loads) / n

        numerator = sum(
            (x[i] - x_mean) * (loads[i] - y_mean)
            for i in range(n)
        )

        denominator = sum(
            (x[i] - x_mean) ** 2
            for i in range(n)
        )

        if denominator != 0:

            slope = numerator / denominator

            intercept = y_mean - slope * x_mean

            prediction = slope * n + intercept

        else:

            prediction = sum(loads[-3:]) / min(3, len(loads))

        prediction = max(0, min(100, prediction))

        try:
            print("\n==============================")
            print("📈 CPU History :", loads)
            print("🤖 Prediction  :", round(prediction, 2))
            print("==============================\n")
        except Exception:
            pass

        return jsonify({
            "success": True,
            "predicted_load": round(prediction, 2),
            "method": "Linear Regression",
            "samples": n
        })

    except Exception as e:

        print(e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "0.0.0.0")
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"

    print("\n==============================")
    print("🤖 ML Service Started")
    print("📈 Linear Regression Model")
    print(f"🌐 Host: {host} | Port: {port}")
    print("==============================\n")

    app.run(
        host=host,
        port=port,
        debug=debug_mode
    )