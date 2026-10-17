const k8s = require("@kubernetes/client-node");

class KubernetesService {
  constructor() {
    this.namespace =
      process.env.K8S_NAMESPACE || "ai-autoscaler";

    this.deploymentName =
      process.env.DEPLOYMENT_NAME || "backend-deployment";

    const kc = new k8s.KubeConfig();

    try {
      kc.loadFromCluster();
      console.log("✅ Running inside Kubernetes Cluster");
    } catch (err) {
      console.log("⚡ Using Local kubeconfig");
      kc.loadFromDefault();
    }

    this.appsApi = kc.makeApiClient(k8s.AppsV1Api);
  }

  // -------------------------
  // Get Deployment
  // -------------------------
  async getDeployment() {
    try {
      const response =
        await this.appsApi.readNamespacedDeployment(
          this.deploymentName,
          this.namespace
        );

      return response.body;
    } catch (err) {
      console.error(
        "❌ Unable to fetch deployment:",
        err.body?.message || err.message
      );
      throw err;
    }
  }

  // -------------------------
  // Current Replica Count
  // -------------------------
  async getReplicaCount() {
    const deployment = await this.getDeployment();

    return deployment.spec.replicas;
  }

  // -------------------------
  // Scale Deployment
  // -------------------------
  async scaleDeployment(desiredReplicas) {
    try {
      const deployment = await this.getDeployment();

      const currentReplicas =
        deployment.spec.replicas;

      if (currentReplicas === desiredReplicas) {
        console.log(
          `ℹ Deployment already running with ${desiredReplicas} replicas`
        );

        return currentReplicas;
      }

      deployment.spec.replicas =
        desiredReplicas;

      await this.appsApi.replaceNamespacedDeployment(
        this.deploymentName,
        this.namespace,
        deployment
      );

      console.log(
        `🚀 Deployment scaled from ${currentReplicas} → ${desiredReplicas}`
      );

      return desiredReplicas;
    } catch (err) {
      console.error(
        "❌ Scaling Failed:",
        err.body?.message || err.message
      );

      throw err;
    }
  }

  // -------------------------
  // Deployment Status
  // -------------------------
  async getStatus() {
    const deployment = await this.getDeployment();

    return {
      deployment: this.deploymentName,
      namespace: this.namespace,
      desiredReplicas:
        deployment.spec.replicas,
      availableReplicas:
        deployment.status.availableReplicas || 0,
      readyReplicas:
        deployment.status.readyReplicas || 0,
      updatedReplicas:
        deployment.status.updatedReplicas || 0,
    };
  }
}

module.exports = new KubernetesService();