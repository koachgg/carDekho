import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';

const router = Router();

router.post('/:sessionId/message', chatController.sendMessage);

export default router;
