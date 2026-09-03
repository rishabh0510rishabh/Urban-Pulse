# 🚀 UrbanPulse / GreenSathi Deployment Guide

This guide provides end-to-end instructions for deploying the **UrbanPulse (GreenSathi)** full-stack application across cloud platforms.

---

## 🏗️ Architecture Overview

The system consists of 3 services:
1. **Frontend**: React SPA (Deploy on **Vercel** / **Netlify**)
2. **Backend**: Node.js / Express API with MongoDB & Session Auth (Deploy on **Render** / **Railway**)
3. **YOLO ML Service (Optional)**: Python FastAPI Service for garbage detection (Deploy on **Render** / **Railway** / **Hugging Face**)

---

## 1. 🌐 Deploy Frontend (Vercel)

### Option A: Via Vercel Dashboard (Recommended)
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. **Framework Preset**: `Create React App`.
6. **Build Command**: `npm run build` (or `react-scripts build`).
7. **Output Directory**: `build`.
8. Add the following **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `REACT_APP_ENVIRONMENT` | `production` | Enables production API endpoints |
   | `REACT_APP_API_URL_PROD` | `https://<your-backend-app>.onrender.com` | Your live backend base URL |
   | `REACT_APP_API_URL_YOLO_PROD` | `https://<your-yolo-app>.onrender.com` | (Optional) Your live YOLO base URL |
   | `REACT_APP_RAZORPAY_KEY_ID` | `rzp_test_...` or `rzp_live_...` | Razorpay Key ID |
   | `CI` | `false` | Prevents CI warnings from failing build |
9. Click **Deploy**.

> Client routing is automatically handled via [`frontend/vercel.json`](file:///c:/Users/risha/Documents/Github/GreenSathi-main/frontend/vercel.json).

---

## 2. ⚙️ Deploy Backend (Render)

### Option A: Web Service on Render
1. Go to [Render](https://render.com) and click **"New Web Service"**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `urbanpulse-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node server.js`)
4. Add the following **Environment Variables** in Render Dashboard:
   | Variable | Example Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Activates secure cookies & production settings |
   | `PORT` | `10000` | Port provided automatically by Render |
   | `SESSION_SECRET` | `a_long_random_secure_secret_string` | Secret key for express-session |
   | `JWT_SECRET` | `a_long_jwt_signing_secret_string` | Secret key for committee auth tokens |
   | `CLOUD_DB_URI` | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/urbanpulse?retryWrites=true&w=majority` | MongoDB Atlas Connection String |
   | `PROD_LINK_REACT` | `https://<your-frontend>.vercel.app` | Frontend production URL for CORS |
   | `CLOUD_NAME` | `<your-cloudinary-cloud-name>` | Cloudinary Cloud Name for image uploads |
   | `CLOUD_API_KEY` | `<your-cloudinary-api-key>` | Cloudinary API Key |
   | `CLOUD_API_SECRET` | `<your-cloudinary-api-secret>` | Cloudinary API Secret |
   | `MAPBOX_ACCESS_TOKEN` | `pk.eyJ...` | (Optional) Mapbox token for geocoding |
   | `OTP_MAIL` | `your-email@gmail.com` | (Optional) Email for sending OTPs |
   | `OTP_PASS` | `your-google-app-password` | (Optional) App password for OTP email |
   | `EMAIL_USER` | `your-email@gmail.com` | (Optional) Email for notification emails |
   | `EMAIL_PASS` | `your-google-app-password` | (Optional) App password for email notifications |
   | `RAZORPAY_KEY_ID` | `rzp_...` | (Optional) Razorpay Key ID |
   | `RAZORPAY_KEY_SECRET` | `...` | (Optional) Razorpay Secret |
   | `TWILIO_ACCOUNT_SID` | `AC...` | (Optional) Twilio Account SID for SMS |
   | `TWILIO_AUTH_TOKEN` | `...` | (Optional) Twilio Auth Token |
   | `TWILIO_PHONE_NUMBER` | `+1...` | (Optional) Twilio Phone Number |
5. Click **Deploy Web Service**.

---

## 3. 🤖 Deploy YOLO Service (Render / Railway)

1. Create a **New Web Service** on Render or Railway.
2. Set **Root Directory**: `yolo_backend`.
3. Set **Environment**: `Python 3`.
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `ALLOWED_ORIGINS` | `https://<your-frontend>.vercel.app` | Allowed CORS origins |
   | `YOLO_PUBLIC_URL` | `https://<your-yolo-app>.onrender.com` | Public base URL for serving uploaded images |
7. Click **Deploy**.

---

## 4. 🗄️ Database Setup (MongoDB Atlas)

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so Render/Railway can connect.
3. Under **Database Access**, create a user with read and write privileges.
4. Copy the connection string format: `mongodb+srv://<user>:<password>@cluster.mongodb.net/urbanpulse?retryWrites=true&w=majority` and set as `CLOUD_DB_URI` in backend environment variables.

---

## 5. ✅ Post-Deployment Verification Checklist

- [ ] Backend root check: Visit `https://<your-backend>.onrender.com/` → Returns `{"status":"success","message":"UrbanPulse Backend is running!"}`.
- [ ] CORS check: Open frontend on Vercel, login and check browser DevTools Network tab for successful API calls.
- [ ] Cookie check: Verify `connect.sid` session cookie has `SameSite=None; Secure` in production.
- [ ] Route refresh: Test refreshing nested routes (e.g. `/events`, `/committee/dashboard`, `/profile`) to verify client-side routing rewrites work properly.
