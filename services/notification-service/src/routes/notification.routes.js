import express from 'express';
import { publishNotification, getUserNotifications, markAsRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/publish', publishNotification);
router.get('/', getUserNotifications);
router.put('/:id/read', markAsRead);

export default router;
