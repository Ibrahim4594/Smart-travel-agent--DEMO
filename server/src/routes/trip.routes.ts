import { Router } from 'express';
import { generateTrip } from '../controllers/trip.controller';

const router = Router();

// POST /api/trip - Generate a trip itinerary
router.post('/trip', generateTrip);

export default router;
