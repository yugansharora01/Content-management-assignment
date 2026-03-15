import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import gatewayRoutes from "./routes/gateway.routes.js";
import { loggerMiddleware } from "./middleware/logger.middleware.js";
import { getRateLimiter } from "./middleware/rateLimiter.middleware.js";
import { connectRedis } from "./config/redis.js";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:8080")
    .split(",")
    .map(o => o.trim());

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman) or matching origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin '${origin}' not allowed`));
        }
    },
    credentials: true,
};


app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        return cors(corsOptions)(req, res, () => res.sendStatus(204));
    }
    next();
});
app.use(cors(corsOptions));
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