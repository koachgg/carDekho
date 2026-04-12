import { Router } from 'express';
import * as carsController from '../controllers/cars.controller';

const router = Router();

router.get('/', carsController.search);
router.get('/:id', carsController.getById);
router.post('/recommend', carsController.recommend);
router.post('/compare', carsController.compare);

export default router;
