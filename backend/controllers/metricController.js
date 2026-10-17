const Metric = require("../models/Metric");

const predictionService = require("../services/predictionService");
const decisionEngine = require("../services/decisionEngine");

const {
  cpuLoadGauge,
  predictedLoadGauge,
} = require("../metrics/metrics");

// =========================
// Save CPU Metric
// =========================
exports.saveMetric = async (req, res) => {
  try {
    const { cpuLoad } = req.body;

    const metric = new Metric({
      cpuLoad,
      timestamp: new Date(),
    });

    await metric.save();

    cpuLoadGauge.set(cpuLoad);

    const metrics = await Metric.find()
      .sort({ timestamp: -1 })
      .limit(5);

    if (metrics.length >= 3) {
      const loads = metrics.reverse().map((m) => m.cpuLoad);

      try {
        const prediction = await predictionService.predict(loads);

        const predictedLoad = prediction.predicted_load;

        predictedLoadGauge.set(predictedLoad);

        console.log("🤖 Predicted Load:", predictedLoad);
        console.log("📈 History:", loads);

        const decision =
          await decisionEngine.evaluate(predictedLoad);

        console.log("🧠 Decision:", decision);

      } catch (err) {
        console.error(
          "Prediction/Decision Error:",
          err.message
        );
      }
    }

    console.log(`Saved CPU Load: ${cpuLoad}`);

    res.status(201).json({
      success: true,
      message: "Metric saved successfully",
      data: metric,
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

    const metrics = await Metric.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: metrics.reverse(),
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
    const metrics = await Metric.find()
      .sort({ timestamp: -1 })
      .limit(5);

    if (metrics.length < 3) {
      return res.json({
        success: false,
        message: "Need at least 3 metrics",
      });
    }

    const loads = metrics.reverse().map((m) => m.cpuLoad);

    const prediction =
      await predictionService.predict(loads);

    const predictedLoad =
      prediction.predicted_load;

    predictedLoadGauge.set(predictedLoad);

    res.json({
      success: true,
      predicted_load: predictedLoad,
      input_loads: loads,
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
    const metrics = await Metric.find()
      .sort({ timestamp: -1 })
      .limit(10);

    if (metrics.length < 3) {
      return res.json({
        success: false,
        message: "Need at least 3 metrics",
      });
    }

    const sorted = metrics.reverse();
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