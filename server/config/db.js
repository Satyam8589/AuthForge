import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

const syncUserIndexes = async () => {
    try {
        const User = mongoose.model("User");
        const collection = mongoose.connection.collection("users");
        const indexes = await collection.indexes();

        // Check if legacy single-field unique indexes exist in MongoDB
        for (const idx of indexes) {
            if (idx.name === "email_1" || idx.name === "username_1" || idx.name === "googleId_1") {
                await collection.dropIndex(idx.name).catch(() => {});
                console.log(`Dropped legacy single-field MongoDB index: ${idx.name}`);
            }
        }

        // Sync Mongoose schema compound indexes
        await User.syncIndexes().catch(() => {});
        console.log("Synchronized project-scoped compound user indexes.");
    } catch (err) {
        console.warn("Index sync warning:", err.message);
    }
};

const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState >= 1) {
        return;
    }
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
        console.warn("MongoDB URI Warning: Neither MONGODB_URI nor MONGO_URI is set in environment variables!");
        return;
    }
    try {
        const db = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = db.connections[0].readyState >= 1;
        console.log("Connected to MongoDB successfully");

        // Asynchronously clean legacy indexes
        syncUserIndexes();
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
};

export default connectDB;