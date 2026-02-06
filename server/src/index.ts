import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import tripRoutes from './routes/trip.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', tripRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Smart Travel Planner API is running' });
});

// Root route
app.get('/', (req, res) => {
    res.send('<h1>Smart Travel Planner API</h1><p>The backend is running! Please use the frontend at <a href="http://localhost:3000">http://localhost:3000</a> to generate your trip.</p>');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 API endpoint: http://localhost:${PORT}/api/trip`);
});
