import express from 'express';
import {
    getDailyTasks,
    createDailyTask,
    updateDailyTask,
    deleteDailyTask,
} from '../controllers/dailyTaskController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes below
router.use(protect);

router.route('/')
    .get(getDailyTasks)
    .post(createDailyTask);

router.route('/:id')
    .put(updateDailyTask)
    .patch(updateDailyTask)
    .delete(deleteDailyTask);

export default router;