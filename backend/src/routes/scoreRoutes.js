import express from 'express';
import { saveScore, getLeaderboard } from '../controllers/scoreController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getLeaderboard);

// Ruta protegida
router.post('/', protect, saveScore);

export default router;
