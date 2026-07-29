// client/src/services/api.js
import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || '';
// Ensure baseURL always ends with /api, even if the user forgot it in Vercel env vars
const baseURL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const api = axios.create({
    baseURL,
    withCredentials: true,
});

export default api;