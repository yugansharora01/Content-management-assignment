import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generatePDF = async (reportData, filename) => {
    return new Promise((resolve, reject) => {
        try {
            const reportsDir = path.join(process.cwd(), 'reports_data');
            if (!fs.existsSync(reportsDir)){
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            const filePath = path.join(reportsDir, filename);
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            
            doc.pipe(stream);

            doc.fontSize(25).text('CMS System Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated At: ${new Date(reportData.timestamp).toLocaleString()}`, { align: 'right' });
            doc.moveDown();
            doc.moveDown();

            doc.fontSize(16).text('User Activity (Auth Service)');
            doc.fontSize(12).text(`Total Users: ${reportData.authData.totalUsers}`);
            doc.text(`Online Users: ${reportData.authData.onlineUsers}`);
            doc.moveDown();

            doc.fontSize(16).text('Content Stats (Content Service)');
            doc.fontSize(12).text(`Total Posts: ${reportData.contentData.totalPosts}`);
            doc.text(`Recently Added: ${reportData.contentData.recentlyAdded}`);
            doc.moveDown();

            doc.fontSize(16).text('System Activity (Audit Service)');
            doc.fontSize(12).text(`Recent Events:`);
            reportData.auditData.recentEvents.forEach(event => {
                 doc.text(`- ${event}`);
            });

            doc.end();

            stream.on('finish', () => {
                 resolve(filePath);
            });
            stream.on('error', (err) => {
                 reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};
