import express from "express";
import dotenv from "dotenv";
import gatewayRoutes from "./routes/gateway.routes.js";
import { loggerMiddleware } from "./middleware/logger.middleware.js";
import { getRateLimiter } from "./middleware/rateLimiter.middleware.js";
import { connectRedis } from "./config/redis.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(loggerMiddleware);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectRedis();
        
        // Setup Rate limiter only after Redis resolves
        app.use(getRateLimiter());

        app.get("/health", (req, res) => {
          res.json({ status: "API Gateway healthy" });
        });

        app.use("/", gatewayRoutes);

        app.listen(PORT, () => {
            console.log(`API Gateway running on port ${PORT}`);
        });
    } catch (error) {
         console.error('Failed to start Gateway Server', error);
         process.exit(1);
    }
}

startServer();