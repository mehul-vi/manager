import express from 'express';
import {
    getDailyAnalytics,
    getMonthlyAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes below
router.use(protect);

router.get('/daily', getDailyAnalytics);
router.get('/monthly', getMonthlyAnalytics);

export default router;