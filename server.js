import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(rateLimit());

app.use("/api/auth", authRoutes);


app.get("/api/health", (req, res) => {
    const HealthCheck = {
        'Health Check': {
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        }
    }
    try {
        res.status(200).json({
            success: true,
            message: "Server is running",
            data: HealthCheck   ,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server is not running",
        });
    }
});

const start = async () => {
    try {
        await connectDB();
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port http://localhost:${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

start();
