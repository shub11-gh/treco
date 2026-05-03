import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000 // 60s timeout to allow Render free tier backend to spin up from sleep
});

// ── Request interceptor: attach JWT ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 (expired / invalid token) ────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local auth state
      localStorage.removeItem('token');
      // Redirect to root with a message
      if (window.location.pathname !== '/') {
        // Since we are outside React component, use standard DOM or simple reload
        // Alternatively we can append ?expired=true to URL
        window.location.href = '/?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
