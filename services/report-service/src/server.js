import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import reportRoutes from "./routes/report.routes.js";
import { startCronJob } from "./cron/report.cron.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/reports", reportRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const startServer = async () => {
    try {
        await connectDB();
        startCronJob();
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
         console.error('Failed to start server', error);
         process.exit(1);
    }
}

startServer();