# Railway Deployment Guide for Backend

This repository is structured as a monorepo. This guide outlines how to deploy the **Backend API** (`/backend`) to [Railway](https://railway.app/).

---

## Architecture Overview on Railway

```
┌────────────────────────────────────────────────────────┐
│                   Railway Project                      │
│                                                        │
│   ┌─────────────────────┐    ┌─────────────────────┐   │
│   │   Backend Service   │───▶│   MongoDB Plugin    │   │
│   │   (Root: /backend)  │    │   (MONGO_URL)       │   │
│   └──────────┬──────────┘    └─────────────────────┘   │
│              │                                         │
│              ▼ (Optional private network)              │
│   ┌─────────────────────┐                              │
│   │  ML Predict Service │                              │
│   │ (Root: /ml-service) │                              │
│   └─────────────────────┘                              │
└────────────────────────────────────────────────────────┘
```

---

## Option 1: Deploy via Railway Web Dashboard (Recommended)

### Step 1: Push Code to GitHub
Ensure your latest changes are pushed to your GitHub repository:
```bash
git add backend/
git commit -m "Configure backend for Railway deployment"
git push origin main
```

### Step 2: Create a New Project on Railway
1. Go to [railway.com](https://railway.com) (or [railway.app](https://railway.app)) and log in with your GitHub account.
2. Click **+ New Project** (or **Deploy from GitHub repo**).
3. Select your repository: `Cloud-Native-AI-Predictive-Kubernetes-Autoscaler-Platform`.
4. Click **Deploy Now**.

---

### Step 3: Configure Root Directory (CRITICAL for Monorepos)
Because the backend code is located inside the `backend` folder:
1. Click on the deployed service card in your Railway project canvas.
2. Navigate to the **Settings** tab.
3. Scroll down to the **General** section.
4. Find **Root Directory** and change it to:
   ```text
   /backend
   ```
5. Click the checkmark to save. Railway will automatically trigger a new build using `backend/Dockerfile` and `backend/railway.json`.

---

### Step 4: Add MongoDB (Database)
1. In your project canvas, click **+ New** (top right) -> **Database** -> **Add MongoDB**.
2. Railway will provision a managed MongoDB database service.
3. Click on the **Backend service** -> open the **Variables** tab.
4. Click **+ New Variable** -> **Add Reference** -> select `MongoDB` -> `MONGO_URL`.
   - Variable Name: `MONGODB_URI` (or `MONGO_URL`)
   - Value: `${{MongoDB.MONGO_URL}}`
5. Click **Save**.

> **Note**: `backend/config/db.js` automatically detects `MONGODB_URI`, `MONGO_URL`, or `DATABASE_URL`. If MongoDB is not provisioned, the backend automatically runs in in-memory simulation mode without crashing.

---

### Step 5: (Optional) Set Environment Variables
In **Backend service** -> **Variables**, you can set:

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `PORT` | *(Leave empty - Railway injects automatically)* | Default is dynamic (e.g. 8080/4000) |
| `MONGODB_URI` | `${{MongoDB.MONGO_URL}}` | MongoDB connection string |
| `ML_SERVICE_URL` | `http://ml-service.railway.internal:5000` | Private network URL if ML service is also in project, or leave blank |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` or `*` | Allowed CORS origin |

---

### Step 6: Generate Public URL
1. Go to your **Backend service** -> **Settings** tab.
2. Scroll down to the **Networking** section.
3. Click **Generate Domain**.
4. Railway will assign a public URL, for example:
   ```text
   https://autoscaler-backend-production.up.railway.app
   ```

---

### Step 7: Verify Backend Deployment
Open your browser or test via terminal:

- **Root endpoint:**
  ```text
  GET https://<your-railway-domain>/
  Response: {"message":"Auto-Scaler Backend API Running"}
  ```

- **Health check endpoint:**
  ```text
  GET https://<your-railway-domain>/health
  Response: {"status":"Healthy","service":"Backend API","timestamp":"..."}
  ```

- **Metrics endpoint:**
  ```text
  GET https://<your-railway-domain>/api/metrics
  ```

---

## Option 2: Deploy via Railway CLI

If you prefer using the command line:

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```
*(This opens a browser window to authenticate)*

### 3. Initialize and Link Project
```bash
cd backend
railway init
```
Choose **Create new project** or link to an existing project.

### 4. Deploy
```bash
railway up
```

### 5. Generate a Public Domain
```bash
railway domain
```
