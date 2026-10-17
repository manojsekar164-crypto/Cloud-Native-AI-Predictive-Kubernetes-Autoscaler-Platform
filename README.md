# Cloud Native AI-Predictive Kubernetes Autoscaler Platform
## Final Year Project - MERN + Python ML

### System Overview
This system demonstrates predictive cloud auto-scaling using machine learning instead of reactive scaling.

### Tech Stack
- **Frontend**: React + Axios + Recharts
- **Backend**: Node.js + Express + MongoDB
- **ML Service**: Python + Flask + scikit-learn
- **Database**: MongoDB

---

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MongoDB (running on localhost:27017)

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install ML service dependencies
cd ../ml-service
pip install -r requirements.txt
```

### Step 2: Start MongoDB
Make sure MongoDB is running on `mongodb://localhost:27017`

### Step 3: Run Services (in separate terminals)

**Terminal 1 - Backend (Port 4000):**
```bash
cd backend
npm run dev
```

**Terminal 2 - ML Service (Port 5000):**
```bash
cd ml-service
python app.py
```

**Terminal 3 - Frontend (Port 3000):**
```bash
cd frontend
npm start
```

### Step 4: Access Dashboard
Open browser: `http://localhost:3000`

---

## Project Structure
```
autoscaler-project/
├── backend/           # Node.js Express API
├── frontend/          # React Dashboard
├── ml-service/        # Python Flask ML API
├── package.json       # Root package file
└── README.md
```

---

## Features
1. ✅ Real-time CPU load simulation
2. ✅ ML-based load prediction
3. ✅ Auto-scaling decisions
4. ✅ Live dashboard with graphs
5. ✅ MongoDB data persistence

---

## API Endpoints

### Backend (Port 4000)
- `POST /api/metrics` - Save CPU metric
- `GET /api/metrics` - Get last N metrics
- `GET /api/predict` - Get ML prediction
- `GET /api/scale` - Get scaling decision

### ML Service (Port 5000)
- `POST /predict` - Predict future load

---
## Kubernetes Secrets

Before deploying, create the required secrets.

### MongoDB Secret

```bash
kubectl create secret generic mongodb-secret \
  --from-literal=MONGO_INITDB_ROOT_USERNAME=<username> \
  --from-literal=MONGO_INITDB_ROOT_PASSWORD=<password> \
  -n ai-autoscaler
```

### Backend Secret

```bash
kubectl create secret generic backend-secret \
  --from-literal=MONGODB_URI="mongodb://<username>:<password>@mongodb:27017/autoscaler?authSource=admin" \
  --from-literal=ML_SERVICE_URL="http://ml-service:5000" \
  -n ai-autoscaler
```

## How It Works
1. Backend generates CPU load every 5 seconds
2. Stores metrics in MongoDB
3. Calls Python ML service for prediction
4. Makes scaling decision based on thresholds
5. Frontend displays real-time data and graphs

---

## Scaling Logic
- **CPU > 70%** → Scale Up ⬆️
- **CPU < 40%** → Scale Down ⬇️
- **40% ≤ CPU ≤ 70%** → No Action

---

## ☁️ Cloud Deployment Guides

- **Backend on Railway**: See [RAILWAY_DEPLOYMENT.md](file:///d:/Devops%20projects/project6/RAILWAY_DEPLOYMENT.md) for deploying the Node.js API with managed MongoDB and Prometheus endpoints.
- **Frontend on Vercel**: See [VERCEL_DEPLOYMENT.md](file:///d:/Devops%20projects/project6/VERCEL_DEPLOYMENT.md) for deploying the React Dashboard and linking it to the live Railway backend.

---

## Notes
- This is a prototype for demonstration purposes
- No real AWS integration (simulated)
- Simple ML model for educational purposes
