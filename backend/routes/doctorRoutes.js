import express from 'express';
import { getRecommendedDoctors } from '../controllers/doctorController.js';
const router = express.Router();

router.get('/recommend', getRecommendedDoctors);

export default router;