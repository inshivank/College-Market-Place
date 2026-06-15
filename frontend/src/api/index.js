import axios from "axios";

const apiRoot = import.meta.env.VITE_API_URL || "http://localhost:5000";
const normalizedBaseUrl = apiRoot.endsWith("/api") ? apiRoot : `${apiRoot.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: normalizedBaseUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("collegeMarketplaceToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
