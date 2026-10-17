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

function App() {
    const [scalingData, setScalingData] = useState(null);
    const [metrics, setMetrics] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRunning, setIsRunning] = useState(true);

    const fetchScalingData = useCallback(async () => {
        if (!isRunning) return;

        try {
            const response = await axios.get(`${API_URL}/scale`);

            if (response.data.success) {
                setScalingData(response.data);

                const logEntry = {
                    time: new Date().toLocaleTimeString(),
                    currentLoad: response.data.current_load,
                    predictedLoad: response.data.predicted_load,
                    decision: response.data.decision
                };

                setLogs(prev => [...prev.slice(-19), logEntry]);

                setError(null);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch scaling data");
        }
    }, [isRunning]);

    const fetchMetrics = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/metrics?limit=20`);

            if (response.data.success) {
                setMetrics(response.data.data);
            }

            setLoading(false);

        } catch (err) {
            console.error(err);
            setError("Failed to fetch metrics");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchScalingData();
        fetchMetrics();
    }, [fetchScalingData, fetchMetrics]);

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
            fetchScalingData();
            fetchMetrics();
        }, 5000);

        return () => clearInterval(interval);

    }, [isRunning, fetchScalingData, fetchMetrics]);

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