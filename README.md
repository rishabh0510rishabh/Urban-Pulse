# 🏙️ Urban Pulse

> **AI-Powered Smart Waste Management & Civic Cleanliness Platform**  
> An intelligent, dual-source cleanliness monitoring system leveraging Computer Vision (YOLOv8) and crowdsourced citizen participation for sustainable, data-driven urban hygiene.

---

## 🌟 Key Highlights  

- 📹 **Automated AI Surveillance**: Real-time CCTV stream analysis with YOLOv8 to detect littered zones, overflowing bins, and public cleanliness violations.
- 📱 **Citizen Crowdsourced Reporting**: Geo-tagged reporting portal with camera capture, instant AI validation, and progress tracking.
- 🔄 **Automated Task Allocation & Dispatch**: Real-time assignment workflows for municipal sanitation teams and OSP officers.
- 📊 **Predictive Analytics & Heatmaps**: Hotspot prediction using footfall trends, historical reports, and seasonal events.
- ♻️ **Recycle & Waste Submission Marketplace**: Franchisee-driven recycling collection, tracking, and rewards.
- 🎮 **Gamified Civic Action**: Points, badges, and leaderboards motivating citizen participation.

---

## 🏗️ System Architecture

```
                       ┌─────────────────────────┐
                       │   React Web Frontend    │
                       │   (Citizen & Officials) │
                       └────────────┬────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   ┌───────────────────────┐                 ┌───────────────────────┐
   │  Node.js / Express    │                 │  FastAPI / Python     │
   │  Backend REST API     │                 │  YOLOv8 AI Service    │
   └───────────┬───────────┘                 └───────────────────────┘
               │
               ▼
   ┌───────────────────────┐
   │     MongoDB Atlas     │
   │   (Database & Auth)   │
   └───────────────────────┘
```

---

## 🧩 Tech Stack
| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, React Router, Leaflet / Maps, Chart.js, Lucide Icons, Vanilla CSS Design System |
| **Backend** | Node.js, Express.js, Passport.js (Local/Session Auth), Multer, Connect-Mongo |
| **Database** | MongoDB Atlas / Mongoose ([Database Schema Spec](DATABASE_SCHEMA.md)) |
| **AI / ML Engine** | Python, FastAPI, YOLOv8 (Ultralytics), PyTorch, OpenCV |
| **Integrations** | Cloudinary (Image Storage), Mapbox (Geocoding), Nodemailer, Twilio, Razorpay |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **MongoDB Atlas** database connection string

---

### 1️⃣ Backend Setup (Node.js / Express)

```bash
cd backend
npm install
```

1. Create a `.env` file in `backend/` (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
2. Configure your MongoDB connection string and server settings in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_URI=your_mongodb_connection_string
   DEV_LINK_REACT=http://localhost:3000
   SESSION_SECRET=your_secret_session_key
   JWT_SECRET=your_jwt_secret_key
   ```
3. Start the server:
   ```bash
   npm start 
   ```
   Server will run on `http://localhost:5000`.

---


### 2️⃣ Frontend Setup (React)

```bash
cd frontend
npm install 
```

1. Configure `frontend/.env`:
   ```env
   REACT_APP_ENVIRONMENT=development
   REACT_APP_API_URL_LOCAL=http://localhost:5000
   REACT_APP_API_URL_YOLO_LOCAL=http://localhost:8000
   ```
2. Start the client:
   ```bash
   npm start
   ```
   Web app will open on `http://localhost:3000`.

---

### 3️⃣ AI Detection Service Setup (FastAPI / YOLOv8)

```bash
cd yolo_backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
The AI service will listen on `http://localhost:8000` to process `/scan` inference requests.

---

## 📂 Project Structure

```
UrbanPulse/
├── backend/                  # Node.js & Express REST API
│   ├── controllers/          # Business logic handlers
│   ├── routes/               # API endpoints
│   ├── schemas/              # Mongoose DB models
│   ├── utils/                # Geocoding, mail, SMS, and cloud storage helpers
│   └── server.js             # Server entry point
│
├── frontend/                 # React Web Application
│   ├── public/               # Public assets, SVGs, manifest, & icons
│   └── src/
│       ├── components/       # Reusable UI components & Navbar
│       ├── pages/            # App pages (Home, Auth, Services, Dashboard)
│       └── utils/            # Axios API config & utilities
│
├── yolo_backend/             # FastAPI YOLOv8 Microservice
│   ├── weights/              # Model weights (my_model.pt)
│   ├── main.py               # FastAPI inference endpoints
│   └── requirements.txt      # Python dependencies
│
└── README.md
```

---

## 🔒 Security & Privacy

- All sensitive credentials and `.env` files are excluded from version control via `.gitignore`.
- Password hashing powered by PBKDF2/Bcrypt and authenticated via session cookies and JWTs.
- Clean separation between microservices and client interfaces.

---

## 📄 License
MIT License(LICENSE).
