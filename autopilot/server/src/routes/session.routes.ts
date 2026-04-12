import { Router } from 'express';
import * as sessionController from '../controllers/session.controller';

const router = Router();

router.post('/', sessionController.create);
router.get('/:id', sessionController.getById);
router.patch('/:id', sessionController.updatePreferences);

export default router;
