// Simulated Decision Engine - no Kubernetes needed for local dev
const MIN_REPLICAS = 2;
const MAX_REPLICAS = 8;

class DecisionEngine {
    constructor() {
        this.lastScaleTime = 0;
        this.cooldown = 30000;
        this.currentReplicas = 2;
    }

    async evaluate(predictedCPU) {
        const now = Date.now();
        let desired = this.currentReplicas;

        if (predictedCPU > 85)
            desired = Math.min(MAX_REPLICAS, this.currentReplicas + 2);
        else if (predictedCPU > 70)
            desired = Math.min(MAX_REPLICAS, this.currentReplicas + 1);
        else if (predictedCPU < 30)
            desired = Math.max(MIN_REPLICAS, this.currentReplicas - 1);

        if (desired !== this.currentReplicas && now - this.lastScaleTime >= this.cooldown) {
            console.log(`🔀 Replicas: ${this.currentReplicas} → ${desired}`);
            this.currentReplicas = desired;
            this.lastScaleTime = now;
        }

        return this._label(predictedCPU);
    }

    _label(cpu) {
        if (cpu > 70) return "Scaling Up ⬆️";
        if (cpu < 30) return "Scaling Down ⬇️";
        return "No Action ✅";
    }
}

module.exports = new DecisionEngine(); 
