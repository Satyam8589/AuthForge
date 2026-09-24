"use client";

import React from "react";
import { Code2 } from "lucide-react";
import { useAuthForge } from "../context/AuthForgeContext";

export default function CodeIntegrationTabs() {
  const {
    activeTab,
    setActiveTab,
    currentConnString,
    currentApiKey,
    currentApiSecret,
    currentProjectId,
    API_BASE_URL
  } = useAuthForge();

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-purple-400" /> SDK Integration Snippet
        </h2>
        <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("express")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === "express" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Express
          </button>
          <button
            onClick={() => setActiveTab("nextjs")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === "nextjs" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Next.js
          </button>
          <button
            onClick={() => setActiveTab("sdk")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === "sdk" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Verify Token
          </button>
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
        {activeTab === "express" && (
          <pre>{`import express from "express";
import { AuthForgeClient } from "authforge-sdk";

const app = express();
const authForge = new AuthForgeClient("${currentConnString}");

// Protect your routes with 1 line of middleware
app.get("/api/dashboard", authForge.expressMiddleware(), (req, res) => {
  res.json({
    message: "Authenticated successfully!",
    user: req.user
  });
});

app.listen(3000, () => console.log("App running on port 3000"));`}</pre>
        )}

        {activeTab === "nextjs" && (
          <pre>{`// Next.js API Route / Middleware Integration
import { AuthForgeClient } from "authforge-sdk";

const authForge = new AuthForgeClient({
  apiKey: "${currentApiKey}",
  apiSecret: "${currentApiSecret}",
  projectId: "${currentProjectId}",
  host: "${API_BASE_URL}"
});

export async function POST(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const result = await authForge.verifyToken(token);

  if (!result.valid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ user: result.data.user });
}`}</pre>
        )}

        {activeTab === "sdk" && (
          <pre>{`import { AuthForgeClient } from "authforge-sdk";

const authForge = new AuthForgeClient("${currentConnString}");

// Verify user JWT token manually
async function authenticateUser(jwtToken) {
  const result = await authForge.verifyToken(jwtToken);
  
  if (result.valid) {
    console.log("Verified User:", result.data.user);
    return result.data.user;
  } else {
    console.error("Token verification failed:", result.message);
  }
}`}</pre>
        )}
      </div>
    </div>
  );
}
