import { Request, Response } from 'express';
import { queryAll } from '../db/database';
import { Review } from '../types';
import { getOrGenerateReviewSummary } from '../services/reviewSummary.service';

export async function getByCarId(req: Request, res: Response): Promise<void> {
  const { carId } = req.params;
  const reviews = await queryAll<Review>(
    'SELECT * FROM reviews WHERE car_id = ? ORDER BY helpful_count DESC',
    [Number(carId)]
  );
  res.json(reviews);
}

export async function getAISummary(req: Request, res: Response): Promise<void> {
  const { carId } = req.params;
  const summary = await getOrGenerateReviewSummary(Number(carId));

  if (!summary) {
    res.status(404).json({ error: { message: 'No reviews found for this car' } });
    return;
  }

  res.json(summary);
}
