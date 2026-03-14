import express from "express";
import dotenv from "dotenv";
import gatewayRoutes from "./routes/gateway.routes.js";
import { loggerMiddleware } from "./middleware/logger.middleware.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";
import { verifyToken } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(loggerMiddleware);
app.use(rateLimiter);
app.use(verifyToken);

app.get("/health", (req, res) => {
  res.json({ status: "API Gateway healthy" });
});

app.use("/", gatewayRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});