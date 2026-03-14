import express from 'express';
import { generateReport, downloadReport } from '../controllers/report.controller.js';

const router = express.Router();

router.post('/generate', generateReport);
router.get('/download/:id', downloadReport);

export default router;
