const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const metricRoutes = require('./routes/metricRoutes');
const { startSimulation } = require('./services/simulator');

// Prometheus Metrics
const {
    register,
    httpRequestCounter,
    httpRequestDuration
} = require('./metrics/metrics');

require('dotenv').config();

const app = express();

// ===========================
// Middleware
// ===========================

const frontendUrl = process.env.FRONTEND_URL;

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, health checks, server-to-server)
        if (!origin) return callback(null, true);
        if (!frontendUrl || frontendUrl === '*' || origin === frontendUrl || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Prometheus Metrics Middleware
app.use((req, res, next) => {

    httpRequestCounter.inc();

    const end = httpRequestDuration.startTimer();

    res.on("finish", () => {
        end();
    });

    next();

});

// ===========================
// Connect to MongoDB
// ===========================

connectDB();

// ===========================
// Routes
// ===========================

app.use('/api', metricRoutes);

// Home Route
app.get('/', (req, res) => {
    res.json({
        message: 'Auto-Scaler Backend API Running'
    });
});

// ===========================
// Health Check Endpoint
// Used by Kubernetes Liveness
// and Readiness Probes
// ===========================

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "Healthy",
        service: "Backend API",
        timestamp: new Date().toISOString()
    });
});

// ===========================
// Prometheus Metrics Endpoint
// ===========================

app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        console.error(error);
        res.status(500).end(error);
    }
});

// ===========================
// Start Server
// ===========================

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {

    console.log('\n========================================');
    console.log(`🚀 Backend Server running on http://${HOST}:${PORT}`);
    console.log(`❤️  Health Check: http://${HOST}:${PORT}/health`);
    console.log(`📈 Prometheus Metrics: http://${HOST}:${PORT}/metrics`);
    console.log('========================================\n');

    // Start CPU Load Simulation
    startSimulation();

});