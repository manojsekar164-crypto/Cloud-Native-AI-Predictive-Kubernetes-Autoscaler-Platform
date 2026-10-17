const axios = require("axios");

const ML_SERVICE_URL =
  (process.env.ML_SERVICE_URL || "http://localhost:5000").replace(/\/$/, "");

class PredictionService {
  async predict(cpuHistory) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
        cpu_history: cpuHistory,
      }, {
        timeout: 5000
      });

      return response.data;
    } catch (error) {
      console.error("Prediction Service Error:", error.message);
      throw error;
    }
  }
}

module.exports = new PredictionService();