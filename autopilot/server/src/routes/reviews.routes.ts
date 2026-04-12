import { Router } from 'express';
import * as reviewsController from '../controllers/reviews.controller';

const router = Router();

router.get('/car/:carId', reviewsController.getByCarId);
router.get('/car/:carId/summary', reviewsController.getAISummary);

export default router;
