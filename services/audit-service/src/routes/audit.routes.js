import express from 'express';
import { createLog, getLogs } from '../controllers/audit.controller.js';

const router = express.Router();

router.post('/', createLog);
router.get('/', getLogs);

export default router;
