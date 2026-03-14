import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
        user: process.env.EMAIL_USER || 'placeholder',
        pass: process.env.EMAIL_PASS || 'placeholder'
    }
});

export const sendReportEmail = async (toEmail, filePath, filename) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"CMS Dashboard" <reports@cms.local>',
            to: toEmail,
            subject: 'System Report Generated',
            text: 'Please find the requested CMS system report attached.',
            attachments: [
                {
                    filename: filename,
                    path: filePath
                }
            ]
        });
        console.log('Report email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw error;
    }
};

export default transporter;
