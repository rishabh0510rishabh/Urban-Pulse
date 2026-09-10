import axios from 'axios';

const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || (process.env.NODE_ENV === "production" ? "production" : "development");

const API_BASE =
  process.env.REACT_APP_API_URL ||
  (ENVIRONMENT === "production"
    ? process.env.REACT_APP_API_URL_PROD || "https://urban-pulse-o4yc.onrender.com"
    : process.env.REACT_APP_API_URL_LOCAL || "http://127.0.0.1:5000");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // automatically applied for all requests
});

// JWT tokens for Committee Authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("committeeToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;