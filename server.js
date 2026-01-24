import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { generalLimiter } from "./middlewares/rateLimiter.middleware.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();

app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(helmet());
app.use(generalLimiter);

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
        app.listen(process.env.PORT || 2000, () => {
            console.log(`Server is running on port http://localhost:${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

start();
