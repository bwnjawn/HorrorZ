import express from 'express';
import { getVictims } from '../controllers/victimController.js';

const router = express.Router();

router.get('/', getVictims);

export default router;
