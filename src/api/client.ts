import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Safety check: ensure baseURL ends with /api
if (!baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
    baseURL = baseURL.endsWith('/') ? `${baseURL}api` : `${baseURL}/api`;
}

console.log(`[API] Client initializing with baseURL: ${baseURL}`);

const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const token = localStorage.getItem('token');
            if (token) {
                console.warn("[API] Session expired - Clearing data");
                localStorage.removeItem('token');
                localStorage.removeItem('user_data');
                useAuthStore.getState().logout();

                // Only redirect if we are on a protected route and not already on login
                if (window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/teacher')) {
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login?expired=true';
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
