// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',  // Uses Vite proxy — no hardcoded port needed
    withCredentials: true,
});

export default api;