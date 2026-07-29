import express from 'express';
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
} from '../controllers/noteController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes below
router.use(protect);

router.route('/')
    .get(getNotes)
    .post(createNote);

router.route('/:id')
    .put(updateNote)
    .delete(deleteNote);

export default router;