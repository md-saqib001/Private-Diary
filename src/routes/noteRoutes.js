import express from 'express';
import { createNote, getNotes } from '#controllers/noteControllers.js';
import { isAuthenticated } from '#middleware/authMiddleware.js';

const router = express.Router();

// Apply isAuthenticated middleware to all note routes
router.use(isAuthenticated);

// Route to get all notes for the logged-in user
router.get('/', getNotes);

// Route to create a new note for the logged-in user
router.post('/', createNote);

export default router;