import express from 'express';
import { registerUser, loginUser, logoutUser } from '#controllers/authControllers.js';

const router = express.Router();

// Registration route(/api/auth/register)
router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/logout', logoutUser);

export default router;