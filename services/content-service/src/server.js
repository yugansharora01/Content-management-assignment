import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import contentRoutes from "./routes/content.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/content", contentRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
         console.error('Failed to start server', error);
         process.exit(1);
    }
}

startServer();