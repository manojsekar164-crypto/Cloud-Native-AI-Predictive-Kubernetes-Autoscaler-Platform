const express = require('express');
const router = express.Router();
const metricController = require('../controllers/metricController');

// POST /api/metrics - Save new CPU metric
router.post('/metrics', metricController.saveMetric);

// GET /api/metrics - Get last N metrics
router.get('/metrics', metricController.getMetrics);

// GET /api/predict - Get ML prediction
router.get('/predict', metricController.getPrediction);

// GET /api/scale - Get scaling decision
router.get('/scale', metricController.getScalingDecision);

// POST /api/start - Start simulation
router.post('/start', metricController.startSimulation);

// POST /api/stop - Stop simulation
router.post('/stop', metricController.stopSimulation);

module.exports = router;
