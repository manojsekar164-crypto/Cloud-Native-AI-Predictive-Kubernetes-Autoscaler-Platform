# Vercel Deployment Guide for Frontend & Full-Stack Integration

This repository is structured as a monorepo. This guide outlines how to deploy the **React Frontend** (`/frontend`) to [Vercel](https://vercel.com/) and connect it seamlessly with the **Live Backend API on Railway**.

---

## 🌐 Full-Stack Cloud Architecture

```
┌─────────────────────────────────┐           ┌────────────────────────────────────────────────────────┐
│     Vercel (Frontend Hosting)   │           │               Railway (Backend Hosting)                │
│                                 │  HTTPS    │                                                        │
│  React Dashboard SPA            │──────────▶│  Node.js + Express API                                 │
│  (Root: /frontend)              │  REST API │  (Root: /backend)                                      │
│  https://<your-app>.vercel.app  │           │  https://cloud-native-ai-predictive-kubernetes-       │
│                                 │           │          autoscaler-production.up.railway.app          │
│                                 │           │                           │                            │
│                                 │           │                           ▼                            │
│                                 │           │                   MongoDB / In-Memory                  │
│                                 │           │                   Metric Simulation Engine             │
└─────────────────────────────────┘           └────────────────────────────────────────────────────────┘
```

---

## 🚀 Option 1: Deploy via Vercel Web Dashboard (Recommended)

### Step 1: Push Code to GitHub
Ensure your latest changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure frontend for Vercel deployment with smart Railway fallback"
git push origin main
```

---

### Step 2: Import Repository in Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** (top right) ➔ **Project**.
3. Under **Import Git Repository**, find:
   ```text
   manojsekar164-crypto/Cloud-Native-AI-Predictive-Kubernetes-Autoscaler-Platform
   ```
4. Click **Import**.

---

### Step 3: Configure Project Settings (CRITICAL for Monorepos)

On the **Configure Project** screen, set the following:

1. **Project Name**:
   ```text
   ai-predictive-autoscaler
   ```
   *(or any name you prefer)*

2. **Framework Preset**:
   - Select **Create React App** (detected automatically).

3. **Root Directory**:
   - Click **Edit** next to Root Directory.
   - Select the `frontend` folder.
   - Click **Continue**.

4. **Build and Output Settings**:
   - Leave toggle switches default (Vercel automatically detects `npm run build` and output directory `build`).

5. **Environment Variables**:
   Expand the **Environment Variables** section and add:

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `REACT_APP_API_URL` | `https://cloud-native-ai-predictive-kubernetes-autoscaler-production.up.railway.app/api` | Live Railway Backend API |

   > **Note**: Even if you skip this variable, the frontend automatically falls back to your Railway backend URL when loaded outside localhost!

---

### Step 4: Click Deploy
1. Click the **Deploy** button.
2. Vercel will clone the `frontend` directory, install dependencies, compile the production bundle, and provision your global edge deployment.
3. Once finished, you will receive your live domain, for example:
   ```text
   https://ai-predictive-autoscaler.vercel.app
   ```

---

## 💻 Option 2: Deploy via Vercel CLI

If you prefer using the command line:

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Log In to Vercel
```bash
vercel login
```
*(Follow the interactive prompt to authenticate with your GitHub or Vercel account)*

### 3. Deploy Frontend from CLI
Navigate to the `frontend` folder and run:
```bash
cd frontend
vercel
```

When prompted:
- **Set up and deploy?** ➔ `Y`
- **Which scope?** ➔ Select your personal or team account
- **Link to existing project?** ➔ `N`
- **What’s your project’s name?** ➔ `ai-predictive-autoscaler-ui`
- **In which directory is your code located?** ➔ `./`

### 4. Deploy to Production
```bash
vercel --prod
```

---

## 🔗 End-to-End Verification ("Deploying Both")

Both your frontend and backend are now connected and live:

| Component | Cloud Provider | URL | Status |
| :--- | :--- | :--- | :--- |
| **Backend API** | Railway | `https://cloud-native-ai-predictive-kubernetes-autoscaler-production.up.railway.app` | ✅ Live |
| **Backend Health** | Railway | `https://cloud-native-ai-predictive-kubernetes-autoscaler-production.up.railway.app/health` | ✅ Healthy |
| **Backend Metrics** | Railway | `https://cloud-native-ai-predictive-kubernetes-autoscaler-production.up.railway.app/api/metrics` | ✅ Active (5s streaming) |
| **Frontend UI** | Vercel | `https://<your-project>.vercel.app` | 🚀 Ready to deploy |

### Verification Checklist:
1. **Open Vercel URL** in your browser.
2. Check that the **Dashboard header** shows **Active** with a green status indicator.
3. Check the **Metric Cards**:
   - Current CPU Load updates every 5 seconds.
   - Predicted Load updates in real time.
   - Scaling Decision shows dynamic actions (e.g. *Scale Up*, *Scale Down*, or *Maintain*).
4. Check the **Recharts Performance Graph**: historical and real-time load curves animate smoothly.
5. Click **Stop** / **Start** button: toggles the load simulation directly on the backend.
6. Check **Console Logs**: shows incoming decisions timestamped every 5 seconds.

---

## 🛡️ CORS & Security Configuration

The backend (`backend/server.js`) has CORS configured to automatically allow:
- Any origin ending with `.vercel.app`
- Custom production domains defined via `FRONTEND_URL`
- `http://localhost:3000` for local development
- Server-to-server health checks and Prometheus scraping

No manual CORS headers or proxy adjustments are required!
