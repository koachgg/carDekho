import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { initializeDatabase } from './db/database';
import { errorHandler } from './middleware/errorHandler';

import sessionRoutes from './routes/session.routes';
import chatRoutes from './routes/chat.routes';
import carsRoutes from './routes/cars.routes';
import reviewsRoutes from './routes/reviews.routes';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/reviews', reviewsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error handler
app.use(errorHandler);

// Initialize DB (async) then start server
async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`[SERVER] AutoPilot API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[SERVER] Failed to start:', err);
  process.exit(1);
});

export default app;
