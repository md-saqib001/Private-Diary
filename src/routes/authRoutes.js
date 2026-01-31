import express from 'express';
import { registerUser, loginUser, logoutUser, getMe } from '#controllers/authControllers.js';
import { isAuthenticated } from '#middleware/authMiddleware.js';
import { is } from 'zod/locales';

const router = express.Router();

// Registration route(/api/auth/register)
router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/logout', logoutUser);

router.get('/me', isAuthenticated, getMe);
export default router;