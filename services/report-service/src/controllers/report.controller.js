import Report from '../models/Report.model.js';
import { gatherReportData } from '../services/reportData.service.js';
import { generatePDF } from '../services/pdfGenerator.service.js';
import { sendReportEmail } from '../config/mail.js';
import path from 'path';
import fs from 'fs';

export const triggerReportGeneration = async (triggerType = 'manual', emailTo = null) => {
    const filename = `report-${Date.now()}.pdf`;
    const reportRecord = new Report({ filename, trigger: triggerType, status: 'pending' });
    await reportRecord.save();

    console.log(`[Report] Starting generation: ${filename}`);
    
    try {
        const data = await gatherReportData();
        const filePath = await generatePDF(data, filename);
        
        reportRecord.status = 'completed';
        await reportRecord.save();
        console.log(`[Report] Generation finished: ${filename}`);

        if (emailTo) {
             console.log(`[Report] Sending email to ${emailTo}`);
             await sendReportEmail(emailTo, filePath, filename);
        }

        return reportRecord;

    } catch (e) {
        reportRecord.status = 'failed';
        reportRecord.errorDetails = e.message;
        await reportRecord.save();
        console.error(`[Report] Task failed:`, e);
        throw e;
    }
}

export const generateReport = async (req, res) => {
    try {
        const targetEmail = req.body.email || process.env.EMAIL_TO || 'admin@cms.local';
        const record = await triggerReportGeneration('manual', targetEmail);
        
        res.status(202).json({
            message: 'Report generation started',
            reportId: record._id,
            status: record.status
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
};

export const downloadReport = async (req, res) => {
    try {
        const record = await Report.findById(req.params.id);
        
        if (!record || record.status !== 'completed') {
            return res.status(404).json({ message: 'Report not found or not yet completed' });
        }

        const filePath = path.join(process.cwd(), 'reports_data', record.filename);
        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${record.filename}`);
            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
        } else {
             res.status(404).json({ message: 'File missing on local disk' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error downloading report', error: error.message });
    }
};
