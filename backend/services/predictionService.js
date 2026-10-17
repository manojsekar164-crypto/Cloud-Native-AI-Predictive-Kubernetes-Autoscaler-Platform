const axios = require("axios");

const ML_SERVICE_URL =
  (process.env.ML_SERVICE_URL || "http://localhost:5000").replace(/\/$/, "");

class PredictionService {
  calculateFallbackPrediction(loads) {
    if (!loads || loads.length === 0) return 50;
    const n = loads.length;
    if (n < 3) return loads[n - 1];

    const x = Array.from({ length: n }, (_, i) => i);
    const x_mean = (n - 1) / 2;
    const y_mean = loads.reduce((acc, v) => acc + v, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - x_mean) * (loads[i] - y_mean);
      denominator += (x[i] - x_mean) ** 2;
    }

    let prediction;
    if (denominator !== 0) {
      const slope = numerator / denominator;
      const intercept = y_mean - slope * x_mean;
      prediction = slope * n + intercept;
    } else {
      const last3 = loads.slice(-3);
      prediction = last3.reduce((acc, v) => acc + v, 0) / last3.length;
    }

    // Clamp between 0 and 100 with 2 decimal places
    prediction = Math.max(0, Math.min(100, Math.round(prediction * 100) / 100));
    return prediction;
  }

  async predict(cpuHistory) {
    try {
      const response = await axios.post(
        `${ML_SERVICE_URL}/predict`,
        { cpu_history: cpuHistory },
        { timeout: 3000 }
      );

      if (response.data && response.data.predicted_load !== undefined) {
        return response.data;
      }
    } catch (error) {
      // Graceful fallback if ML microservice is offline or not yet deployed on Railway
      console.warn(
        `⚠️ ML microservice at ${ML_SERVICE_URL} unreachable (${error.message}). Using built-in regression fallback.`
      );
    }

    const fallbackLoad = this.calculateFallbackPrediction(cpuHistory);
    return {
      success: true,
      predicted_load: fallbackLoad,
      method: "Linear Regression (Cloud Resilient Fallback)",
      samples: cpuHistory.length,
    };
  }
}

module.exports = new PredictionService();