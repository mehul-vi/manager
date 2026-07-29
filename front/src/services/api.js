// client/src/services/api.js
import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || '';
// Strip trailing slash if present
if (rawBaseUrl.endsWith('/')) {
    rawBaseUrl = rawBaseUrl.slice(0, -1);
}

// Ensure baseURL always ends with /api
const baseURL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const api = axios.create({
    baseURL,
    withCredentials: true,
});

export default api;