import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import projectRoutes from "../../routes/project.route.js";
import sdkRoutes from "../../routes/sdk.route.js";
import authRoutes from "../../routes/auth.route.js";
import User from "../../models/User.model.js";
import Project from "../../models/Project.model.js";
import { AuthForgeClient } from "../../sdk/index.js";
import { generateAccessToken } from "../../utils/jwt.js";

let mongoServer;
let app;
let developerToken;
let developerUser;
let project;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
    app.use("/api/projects", projectRoutes);
    app.use("/api/sdk", sdkRoutes);

    // Create a developer user
    developerUser = await User.create({
        name: "SDK Dev",
        username: "sdkdev",
        email: "sdkdev@example.com",
        password: "HashedPassword123!"
    });

    developerToken = generateAccessToken({ userId: developerUser._id, role: developerUser.role });

    // Create a project for SDK testing
    project = await Project.create({
        name: "SDK Test Integration App",
        ownerId: developerUser._id
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("SDK & Connection String Integration Tests", () => {
    test("AuthForgeClient should parse connection string correctly", () => {
        const connStr = `authforge://${project.apiKey}:${project.apiSecret}@${project.projectId}?host=http%3A%2F%2Flocalhost%3A2000`;
        const parsed = AuthForgeClient.parseConnectionString(connStr);

        expect(parsed.apiKey).toBe(project.apiKey);
        expect(parsed.apiSecret).toBe(project.apiSecret);
        expect(parsed.projectId).toBe(project.projectId);
        expect(parsed.host).toBe("http://localhost:2000");
    });

    test("POST /api/sdk/verify-token should verify a valid user access token", async () => {
        const clientUser = await User.create({
            name: "Client EndUser",
            username: "enduser1",
            email: "enduser1@example.com",
            password: "HashedPassword123!"
        });

        const userAccessToken = generateAccessToken({ userId: clientUser._id, role: clientUser.role });

        const res = await request(app)
            .post("/api/sdk/verify-token")
            .set("X-AuthForge-API-Key", project.apiKey)
            .set("X-AuthForge-API-Secret", project.apiSecret)
            .set("X-AuthForge-Project-ID", project.projectId)
            .send({ token: userAccessToken });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.valid).toBe(true);
        expect(res.body.data.user._id).toBe(clientUser._id.toString());
        expect(res.body.data.user.email).toBe("enduser1@example.com");
    });

    test("POST /api/sdk/verify-token should reject invalid token", async () => {
        const res = await request(app)
            .post("/api/sdk/verify-token")
            .set("X-AuthForge-API-Key", project.apiKey)
            .set("X-AuthForge-API-Secret", project.apiSecret)
            .send({ token: "invalid.jwt.token" });

        expect(res.status).toBe(401);
        expect(res.body.valid).toBe(false);
    });

    test("POST /api/sdk/verify-token should reject invalid API keys", async () => {
        const res = await request(app)
            .post("/api/sdk/verify-token")
            .set("X-AuthForge-API-Key", "af_pk_invalid_key")
            .send({ token: "some.token" });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("Authentication failed");
    });

    test("POST /api/sdk/auth/google should register/login user via Google OAuth data", async () => {
        const googleUserData = {
            email: "googlesdkuser@example.com",
            googleId: "google-123456789",
            name: "Google SDK User",
            picture: "https://lh3.googleusercontent.com/a/sample"
        };

        const res = await request(app)
            .post("/api/sdk/auth/google")
            .set("X-AuthForge-API-Key", project.apiKey)
            .set("X-AuthForge-API-Secret", project.apiSecret)
            .set("X-AuthForge-Project-ID", project.projectId)
            .send(googleUserData);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.user.email).toBe("googlesdkuser@example.com");
        expect(res.body.data.user.googleId).toBe("google-123456789");
    });
});

