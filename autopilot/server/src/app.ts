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
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Async DB Initialization Middleware for Serverless
let isDbReady = false;
app.use(async (req, res, next) => {
  if (!isDbReady) {
    try {
      await initializeDatabase();
      isDbReady = true;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/reviews', reviewsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production (Only if NOT on Vercel functions)
if (!process.env.VERCEL) {
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

export default app;
