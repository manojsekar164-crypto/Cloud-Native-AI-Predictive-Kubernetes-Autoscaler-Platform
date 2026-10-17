const axios = require('axios');

// Generate random CPU load between 20% and 90%
function generateCPULoad() {
    return Math.floor(Math.random() * (90 - 20 + 1)) + 20;
}

// Start simulation
function startSimulation() {
    console.log("🔄 Starting CPU Load Simulation...\n");

    const port = process.env.PORT || 4000;
    const metricUrl = `http://127.0.0.1:${port}/api/metrics`;

    setInterval(async () => {
        try {
            const metricController = require('../controllers/metricController');
            if (metricController.getSimulationStatus && !metricController.getSimulationStatus()) {
                return;
            }

            const cpuLoad = generateCPULoad();

            const response = await axios.post(
                metricUrl,
                { cpuLoad },
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    timeout: 4000
                }
            );

            console.log(`📊 Generated CPU Load: ${cpuLoad}%`);
            console.log("✅ Saved Successfully");
            console.log("--------------------------------");

        } catch (error) {

            console.log("\n❌ Simulation Error");
            console.log("--------------------------------");

            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Response:", error.response.data);
            }

            console.log("Message:", error.message);

            if (error.code) {
                console.log("Code:", error.code);
            }

            console.log("--------------------------------\n");
        }

    }, 5000);
}

module.exports = {
    startSimulation,
    generateCPULoad
};