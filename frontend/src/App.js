import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import './App.css';

// API URL from environment variable or intelligent domain fallback
// If REACT_APP_API_URL is set, use it.
// If running on localhost/127.0.0.1, fallback to local backend (http://localhost:4000/api).
// If deployed in cloud (e.g. *.vercel.app), default to the live production Railway backend!
const defaultApiUrl = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:4000/api'
    : 'https://cloud-native-ai-predictive-kubernetes-autoscaler-production.up.railway.app/api';

const rawApiUrl = (process.env.REACT_APP_API_URL || defaultApiUrl).trim().replace(/\/+$/, '');
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

function calculatePrediction(loads) {
    if (!loads || loads.length === 0) return 50;
    const n = loads.length;
    if (n < 3) return loads[n - 1];

    const x_mean = (n - 1) / 2;
    const y_mean = loads.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (i - x_mean) * (loads[i] - y_mean);
        den += (i - x_mean) ** 2;
    }
    const pred = den !== 0 ? (num / den) * n + (y_mean - (num / den) * x_mean) : loads[n - 1];
    return Math.max(0, Math.min(100, Math.round(pred * 10) / 10));
}

function getScalingDecision(predictedLoad) {
    if (predictedLoad > 70) return "Scaling Up ⬆️";
    if (predictedLoad < 30) return "Scaling Down ⬇️";
    return "No Action ✅";
}

function App() {
    const [scalingData, setScalingData] = useState(null);
    const [metrics, setMetrics] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRunning, setIsRunning] = useState(true);

    const fetchScalingData = useCallback(async (currentMetrics) => {
        if (!isRunning) return;

        let resolved = false;

        try {
            const response = await axios.get(`${API_URL}/scale`, { timeout: 3000 });

            if (response.data && response.data.success) {
                setScalingData(response.data);

                const logEntry = {
                    time: new Date().toLocaleTimeString(),
                    currentLoad: response.data.current_load,
                    predictedLoad: response.data.predicted_load,
                    decision: response.data.decision
                };

                setLogs(prev => [...prev.slice(-19), logEntry]);
                setError(null);
                resolved = true;
            }
        } catch (err) {
            console.warn("API /scale unreachable, calculating from live metrics stream:", err.message);
        }

        // Resilient fallback: compute from metrics stream so dashboard never breaks
        if (!resolved) {
            const source = (currentMetrics && currentMetrics.length > 0) ? currentMetrics : metrics;
            if (source && source.length > 0) {
                const loads = source.map(m => m.cpuLoad);
                const currentLoad = loads[loads.length - 1];
                const predictedLoad = calculatePrediction(loads);
                const decision = getScalingDecision(predictedLoad);

                setScalingData({
                    current_load: currentLoad,
                    predicted_load: predictedLoad,
                    decision: decision,
                    success: true
                });

                const logEntry = {
                    time: new Date().toLocaleTimeString(),
                    currentLoad: currentLoad,
                    predictedLoad: predictedLoad,
                    decision: decision
                };

                setLogs(prev => [...prev.slice(-19), logEntry]);
                setError(null);
            }
        }
    }, [isRunning, metrics]);

    const fetchMetrics = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/metrics?limit=20`, { timeout: 4000 });

            if (response.data && response.data.success) {
                const metricList = response.data.data;
                setMetrics(metricList);
                fetchScalingData(metricList);
            }

            setLoading(false);
            setError(null);

        } catch (err) {
            console.error("Failed to fetch metrics", err);
            setLoading(false);
        }
    }, [fetchScalingData]);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    const toggleSimulation = async () => {
        try {
            const endpoint = isRunning ? "/stop" : "/start";

            await axios.post(`${API_URL}${endpoint}`);

            setIsRunning(prev => !prev);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            fetchMetrics();
        }, 5000);

        return () => clearInterval(interval);

    }, [isRunning, fetchMetrics]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="App">
            <Dashboard
                scalingData={scalingData}
                metrics={metrics}
                logs={logs}
                error={error}
                isRunning={isRunning}
                onToggleSimulation={toggleSimulation}
            />
        </div>
    );
}

export default App;