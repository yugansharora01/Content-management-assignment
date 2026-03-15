import axios from 'axios';

export const publishAuditEvent = async (action, details, token = '') => {
    try {
        const auditUrl = process.env.AUDIT_SERVICE_URL || 'http://localhost:3005';
        await axios.post(`${auditUrl}/`, { action, details }, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        }).catch(e => console.error(`[Audit] Failed to publish ${action}: Is audit-service up?`));
    } catch (e) {
        console.error(`[Audit] Error:`, e.message);
    }
};

export const publishNotificationEvent = async (type, message, relatedId) => {
    try {
         const notifyUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';
         await axios.post(`${notifyUrl}/publish`, { type, message, relatedId })
         .catch(e => console.error(`[Notification] Failed to publish ${type}: Is notification-service up?`));
    } catch (e) {
         console.error(`[Notification] Error:`, e.message);
    }
};
