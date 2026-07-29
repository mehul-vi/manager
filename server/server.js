import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Resolve directory paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly locate and load .env from the server directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import dailyTaskRoutes from './routes/dailyTaskRoutes.js';
import monthlyTaskRoutes from './routes/monthlyTaskRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Connect to MongoDB
connectDB();

const app = express();

// Core Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration (Configured for HTTP-only cookies)
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            return callback(null, origin);
        },
        credentials: true,
    })
);

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/daily-tasks', dailyTaskRoutes);
app.use('/api/monthly-tasks', monthlyTaskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);

// API root route
app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'API root. Use /api/health or one of the API endpoints under /api/auth, /api/daily-tasks, /api/monthly-tasks, /api/notes, /api/analytics',
    });
});

// Healthcheck Route
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is operational' });
});

// API 404 fallback
app.use('/api', (req, res) => {
    res.status(404).json({
        message: 'API route not found. Check the path and try /api/health or another valid endpoint.',
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
}

export default app;