import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

export const verifyToken = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    // 1. Check Redis Blocklist instantly
    const isBlocklisted = await redisClient.get(`bl_${token}`);
    if (isBlocklisted) {
      return res.status(401).json({ message: "Token has been revoked/logged out" });
    }

    // 2. Validate JWT Cryptographically
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach User data for downstream Microservices
    // req.headers modification guarantees the proxy forwards it instantly
    req.headers['x-user-id'] = decoded.id || decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};