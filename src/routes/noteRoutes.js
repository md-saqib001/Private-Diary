import express from 'express';
import { getNotes, getNoteByDate, saveDailyPage } from '#controllers/noteControllers.js';
import { isAuthenticated } from '#middleware/authMiddleware.js';

const router = express.Router();

// Apply isAuthenticated middleware to all note routes
router.use(isAuthenticated);

// Route to get all notes for the logged-in user (year and month filters optional)
router.get('/', getNotes);

router.get('/:date', getNoteByDate);

// Route to create a new note for the logged-in user
router.post('/', saveDailyPage);

export default router;