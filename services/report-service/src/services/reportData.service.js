import axios from 'axios';

// Helper function to gracefully get info without crashing if another microservice is missing or not fully built yet
export const gatherReportData = async () => {
    let authData = { totalUsers: 0, onlineUsers: 0 };
    let contentData = { totalPosts: 0, recentlyAdded: 0 };
    let auditData = { recentEvents: [] };

    try {
        const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3000'; // Defaulting to gateway port 3000 locally
        // Mocked or Real Call
        // const res = await axios.get(`${authUrl}/api/auth/stats`);
        // authData = res.data;
        authData = { totalUsers: 15, onlineUsers: 3 }; // Mocking since we did not build stats APIs in auth service
    } catch (e) { console.error('Auth service data gather failed', e.message); }

    try {
         const contentUrl = process.env.CONTENT_SERVICE_URL || 'http://localhost:3000';
         // contentData = (await axios.get(`${contentUrl}/api/content/stats`)).data;
         contentData = { totalPosts: 120, recentlyAdded: 15 };
    } catch (e) { console.error('Content service data gather failed', e.message); }
    
    try {
         const auditUrl = process.env.AUDIT_SERVICE_URL || 'http://localhost:3000';
         // auditData = (await axios.get(`${auditUrl}/api/audit/stats`)).data;
         auditData = { recentEvents: ['USER_LOGIN', 'CONTENT_CREATED', 'REPORT_GENERATED'] };
    } catch (e) { console.error('Audit service data gather failed', e.message); }

    return {
        timestamp: new Date().toISOString(),
        authData,
        contentData,
        auditData
    };
};
