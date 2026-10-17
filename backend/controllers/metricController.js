const Metric = require("../models/Metric");

const predictionService = require("../services/predictionService");
const decisionEngine = require("../services/decisionEngine");

const {
  cpuLoadGauge,
  predictedLoadGauge,
} = require("../metrics/metrics");

const { isConnected } = require("../config/db");

// In-memory buffer to keep dashboard functioning even when MongoDB is offline/unreachable
const inMemoryMetrics = [];

async function getRecentMetrics(limit = 20) {
  if (isConnected()) {
    try {
      const records = await Metric.find().sort({ timestamp: -1 }).limit(limit);
      if (records && records.length > 0) {
        return records;
      }
    } catch (err) {
      console.warn("⚠️ MongoDB query error, using in-memory buffer:", err.message);
    }
  }
  return inMemoryMetrics.slice(-limit).reverse();
}

// =========================
// Save CPU Metric
// =========================
exports.saveMetric = async (req, res) => {
  try {
    const { cpuLoad } = req.body;
    const metricDoc = {
      cpuLoad,
      timestamp: new Date(),
    };

    let savedMetric = metricDoc;

    if (isConnected()) {
      try {
        const metric = new Metric(metricDoc);
        await metric.save();
        savedMetric = metric;
      } catch (dbErr) {
        console.warn("⚠️ MongoDB save failed, buffering in memory:", dbErr.message);
        inMemoryMetrics.push(metricDoc);
        if (inMemoryMetrics.length > 100) inMemoryMetrics.shift();
      }
    } else {
      inMemoryMetrics.push(metricDoc);
      if (inMemoryMetrics.length > 100) inMemoryMetrics.shift();
    }

    cpuLoadGauge.set(cpuLoad);

    const metrics = await getRecentMetrics(5);

    if (metrics.length >= 3) {
      const loads = metrics.slice().reverse().map((m) => m.cpuLoad);

      try {
        const prediction = await predictionService.predict(loads);
        const predictedLoad = prediction.predicted_load;

        predictedLoadGauge.set(predictedLoad);

        console.log("🤖 Predicted Load:", predictedLoad);
        console.log("📈 History:", loads);

        const decision = await decisionEngine.evaluate(predictedLoad);
        console.log("🧠 Decision:", decision);

      } catch (err) {
        console.error("Prediction/Decision Error:", err.message);
      }
    }

    console.log(`Saved CPU Load: ${cpuLoad}`);

    res.status(201).json({
      success: true,
      message: "Metric saved successfully",
      data: savedMetric,
      storage: isConnected() ? "mongodb" : "in-memory"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// =========================
// Get Metrics
// =========================
exports.getMetrics = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const metrics = await getRecentMetrics(limit);

    res.json({
      success: true,
      data: metrics.slice().reverse(),
      storage: isConnected() ? "mongodb" : "in-memory"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// =========================
// Get Prediction
// =========================
exports.getPrediction = async (req, res) => {
  try {
    const metrics = await getRecentMetrics(5);

    if (metrics.length < 3) {
      return res.json({
        success: false,
        message: "Need at least 3 metrics",
      });
    }

    const loads = metrics.slice().reverse().map((m) => m.cpuLoad);
    const prediction = await predictionService.predict(loads);
    const predictedLoad = prediction.predicted_load;

    predictedLoadGauge.set(predictedLoad);

    res.json({
      success: true,
      predicted_load: predictedLoad,
      input_loads: loads,
      storage: isConnected() ? "mongodb" : "in-memory"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// =========================
// Get Scaling Decision
// =========================
exports.getScalingDecision = async (req, res) => {
  try {
    const metrics = await getRecentMetrics(10);

    if (metrics.length < 3) {
      return res.json({
        success: false,
        message: "Need at least 3 metrics",
      });
    }

    const sorted = metrics.slice().reverse();
    const loads = sorted.map((m) => m.cpuLoad);
    const currentLoad = loads[loads.length - 1];

    const prediction = await predictionService.predict(loads);
    const predictedLoad = prediction.predicted_load;

    predictedLoadGauge.set(predictedLoad);
    cpuLoadGauge.set(currentLoad);

    const decision = await decisionEngine.evaluate(predictedLoad);

    console.log(`📊 Current: ${currentLoad}% | 🔮 Predicted: ${predictedLoad}% | ⚡ ${decision}`);

    res.json({
      success: true,
      current_load: currentLoad,
      predicted_load: predictedLoad,
      decision: decision,
      timestamp: new Date().toISOString(),
      storage: isConnected() ? "mongodb" : "in-memory"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// =========================
// Simulation Control
// =========================

let isSimulationRunning = true;

exports.startSimulation = (req, res) => {
  isSimulationRunning = true;

  console.log("▶ Simulation Started");

  res.json({
    success: true,
    message: "Simulation Started",
  });
};

exports.stopSimulation = (req, res) => {
  isSimulationRunning = false;

  console.log("⏸ Simulation Stopped");

  res.json({
    success: true,
    message: "Simulation Stopped",
  });
};

exports.getSimulationStatus = () =>
  isSimulationRunning;