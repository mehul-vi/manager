import express from 'express';
import {
    getMonthlyTasks,
    createMonthlyTask,
    updateMonthlyTask,
    deleteMonthlyTask,
} from '../controllers/monthlyTaskController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes below
router.use(protect);

router.route('/')
    .get(getMonthlyTasks)
    .post(createMonthlyTask);

router.route('/:id')
    .put(updateMonthlyTask)
    .patch(updateMonthlyTask)
    .delete(deleteMonthlyTask);

export default router;