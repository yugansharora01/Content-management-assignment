import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis.js';
import axios from 'axios';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const sendAuditLog = async (action, details, token) => {
    try {
        // Assuming api-gateway or direct call to audit-service
        const auditUrl = process.env.AUDIT_SERVICE_URL || 'http://localhost:3005';
        await axios.post(`${auditUrl}/api/audit`, { action, details }, {
           headers: { Authorization: `Bearer ${token}` }
        }).catch(e => console.error("Audit log failed to send, is audit-service up?", e.message));
    } catch (e) {
        console.error("Failed to send audit log:", e.message);
    }
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      // Store basic session info in Redis
      await redisClient.set(`session:${user._id}`, token, {
        EX: 30 * 24 * 60 * 60 // 30 days
      });
      
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token,
      });

      // Send async audit log
      sendAuditLog('USER_LOGIN', { userId: user._id, email: user.email }, token);

    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
           return res.status(400).json({ message: 'No token provided' });
        }
        
        // Decode token to get user ID or expiration
        const decoded = jwt.decode(token);
        if (decoded && decoded.id) {
            // Remove session from Redis
            await redisClient.del(`session:${decoded.id}`);
            // Add token to blocklist in Redis for the remaining TTL to be safe
            // Let's use a 30-day default TTL for the blocklist to match the token expiry
            await redisClient.set(`blocklist:${token}`, 'true', {
               EX: 30 * 24 * 60 * 60
            });
            return res.json({ message: 'Successfully logged out' });
        }
        res.status(400).json({ message: 'Invalid token' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
