import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import { generalLimiter } from "./middlewares/rateLimiter.middleware.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import projectRoutes from "./routes/project.route.js";
import sdkRoutes from "./routes/sdk.route.js";

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:5000', 'http://localhost:2000'],
    credentials: true
}));
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            "connect-src": ["'self'", "https://accounts.google.com", "https://www.googleapis.com"],
            "frame-src": ["'self'", "https://accounts.google.com"],
            "img-src": ["'self'", "data:", "https://*.googleusercontent.com"],
        },
    },
}));
app.use(generalLimiter);

app.use(express.static('public'));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sdk", sdkRoutes);

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
