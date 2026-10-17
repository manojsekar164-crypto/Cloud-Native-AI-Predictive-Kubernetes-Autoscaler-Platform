const client = require("prom-client");

// Create Registry
const register = new client.Registry();

// Collect Node.js default metrics
client.collectDefaultMetrics({
    register
});

// HTTP Request Counter
const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    registers: [register]
});

// HTTP Request Duration
const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration",
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register]
});

// CPU Load Gauge
const cpuLoadGauge = new client.Gauge({
    name: "cpu_load_percent",
    help: "Current CPU Load",
    registers: [register]
});

// Predicted CPU Load Gauge
const predictedLoadGauge = new client.Gauge({
    name: "predicted_cpu_load_percent",
    help: "Predicted CPU Load",
    registers: [register]
});

// Scale Up Counter
const scaleUpCounter = new client.Counter({
    name: "scale_up_total",
    help: "Number of scale-up events",
    registers: [register]
});

// Scale Down Counter
const scaleDownCounter = new client.Counter({
    name: "scale_down_total",
    help: "Number of scale-down events",
    registers: [register]
});

module.exports = {
    register,
    httpRequestCounter,
    httpRequestDuration,
    cpuLoadGauge,
    predictedLoadGauge,
    scaleUpCounter,
    scaleDownCounter
};