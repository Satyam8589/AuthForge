import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
    createProjectService,
    getUserProjectsService,
    getProjectByIdService,
    regenerateApiSecretService,
    deleteProjectService
} from "../../services/project.service.js";
import User from "../../models/User.model.js";
import Project from "../../models/Project.model.js";

let mongoServer;
let userId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const user = await User.create({
        name: "Test Developer",
        username: "testdev",
        email: "dev@example.com",
        password: "Password123!"
    });
    userId = user._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Project.deleteMany({});
});

describe("Project Service Unit Tests", () => {
    test("should create a new project with connection string", async () => {
        const projectData = { name: "My Web App", allowedOrigins: ["http://localhost:3000"] };
        const project = await createProjectService(userId, projectData, "http://localhost:2000");

        expect(project.name).toBe("My Web App");
        expect(project.apiKey).toBeDefined();
        expect(project.apiKey).toMatch(/^af_pk_/);
        expect(project.apiSecret).toMatch(/^af_sk_/);
        expect(project.projectId).toMatch(/^proj_/);
        expect(project.connectionString).toContain("authforge://");
        expect(project.connectionString).toContain(project.apiKey);
        expect(project.connectionString).toContain(project.projectId);
    });

    test("should throw error if project name is missing", async () => {
        await expect(
            createProjectService(userId, { name: "   " }, "http://localhost:2000")
        ).rejects.toThrow("Project name is required");
    });

    test("should get all projects for user", async () => {
        await createProjectService(userId, { name: "App 1" }, "http://localhost:2000");
        await createProjectService(userId, { name: "App 2" }, "http://localhost:2000");

        const projects = await getUserProjectsService(userId, "http://localhost:2000");
        expect(projects.length).toBe(2);
        expect(projects[0].name).toBe("App 2");
        expect(projects[1].name).toBe("App 1");
    });

    test("should regenerate API secret", async () => {
        const created = await createProjectService(userId, { name: "Secret Test App" }, "http://localhost:2000");
        const oldSecret = created.apiSecret;

        const updated = await regenerateApiSecretService(created.projectId, userId, "http://localhost:2000");
        expect(updated.apiSecret).not.toBe(oldSecret);
        expect(updated.apiSecret).toMatch(/^af_sk_/);
    });

    test("should delete a project", async () => {
        const created = await createProjectService(userId, { name: "To Delete App" }, "http://localhost:2000");
        const result = await deleteProjectService(created.projectId, userId);

        expect(result.projectId).toBe(created.projectId);
        const count = await Project.countDocuments({ ownerId: userId });
        expect(count).toBe(0);
    });
});
