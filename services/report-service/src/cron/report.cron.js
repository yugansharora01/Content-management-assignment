import cron from 'node-cron';
import { triggerReportGeneration } from '../controllers/report.controller.js';

export const startCronJob = () => {
    // Run daily at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('[Cron] Initiating daily report task');
        const defaultEmail = process.env.EMAIL_TO || 'admin@cms.local';
        
        try {
            await triggerReportGeneration('cron', defaultEmail);
            console.log('[Cron] Daily report task succeeded');
        } catch (error) {
            console.error('[Cron] Daily report task failed:', error.message);
        }
    });

    console.log('Report Cron Job scheduled.');
};
