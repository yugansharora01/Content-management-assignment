import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { initSocket } from "./config/socket.js";
import notificationRoutes from "./routes/notification.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/", notificationRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const startServer = async () => {
    try {
        await connectDB();
        
        // Initialize WebSocket Server
        initSocket(server);

        server.listen(PORT, () => {
            console.log(`Notification Server & WebSockets started on port ${PORT}`);
        });
    } catch (error) {
         console.error('Failed to start server', error);
         process.exit(1);
    }
}

startServer();