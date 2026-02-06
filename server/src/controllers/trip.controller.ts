import { Request, Response } from 'express';
import { TripRequest } from '../types';
import { generateItinerary } from '../services/itinerary.service';

export async function generateTrip(req: Request, res: Response): Promise<void> {
    try {
        const { destination, days, budget, interests } = req.body as TripRequest;

        // Validate input
        if (!destination || !days || !budget) {
            res.status(400).json({
                error: 'Missing required fields: destination, days, budget',
            });
            return;
        }

        if (days < 1 || days > 14) {
            res.status(400).json({
                error: 'Days must be between 1 and 14',
            });
            return;
        }

        console.log(`📍 Generating trip to ${destination} for ${days} days`);
        console.log(`💰 Budget: ${budget}, Interests: ${interests?.join(', ') || 'general'}`);

        // Generate the itinerary
        const trip = await generateItinerary({
            destination,
            days,
            budget,
            interests: interests || [],
        });

        res.json(trip);
    } catch (error) {
        console.error('Error generating trip:', error);
        res.status(500).json({
            error: 'Failed to generate trip itinerary',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
