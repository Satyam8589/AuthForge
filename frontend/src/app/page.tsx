"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Key, 
  Terminal, 
  Copy, 
  Check, 
  Server, 
  Zap, 
  Code2, 
  ExternalLink, 
  Activity, 
  Lock, 
  Cpu, 
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers
} from "lucide-react";

export default function AuthForgeDashboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [serverLatency, setServerLatency] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"express" | "nextjs" | "react" | "sdk">("express");
  
  // API Test state
  const [testEmail, setTestEmail] = useState("admin@authforge.dev");
  const [testPassword, setTestPassword] = useState("Password123!");
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  const sampleConnString = "authforge://af_key_9f82a1:af_sec_3b71e4@proj_default?host=http://localhost:5000";
  const sampleApiKey = "af_key_9f82a17d84e921";
  const sampleApiSecret = "af_sec_3b71e40c92fa118e7";
  const sampleProjectId = "proj_default";

  // Check health of backend server
  const checkServerHealth = async () => {
    setServerStatus("checking");
    const startTime = performance.now();
    try {
      const res = await fetch("http://localhost:5000/api/health");
      const endTime = performance.now();
      if (res.ok) {
        setServerStatus("online");
        setServerLatency(Math.round(endTime - startTime));
      } else {
        setServerStatus("offline");
        setServerLatency(null);
      }
    } catch {
      setServerStatus("offline");
      setServerLatency(null);
    }
  };

  useEffect(() => {
    checkServerHealth();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingApi(true);
    setApiResponse("Connecting to AuthForge backend server...");
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiResponse(
        JSON.stringify({ 
          error: "Failed to connect to backend server", 
          details: err.message,
          hint: "Ensure Express backend (server.js) is running on http://localhost:5000"
        }, null, 2)
      );
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-lg shadow-indigo-500/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                AuthForge
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                v1.0.0
              </span>
            </div>
          </div>

          {/* Backend Health Status Badge */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" /> API Server:
              </span>
              {serverStatus === "checking" && (
                <span className="text-amber-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
                </span>
              )}
              {serverStatus === "online" && (
                <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online ({serverLatency}ms)
                </span>
              )}
              {serverStatus === "offline" && (
                <span className="text-rose-400 flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Offline (Port 5000)
                </span>
              )}
              <button 
                onClick={checkServerHealth} 
                className="ml-1 text-slate-400 hover:text-indigo-400 transition-colors"
                title="Ping Server"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <a
              href="https://github.com/Satyam8589/AuthForge"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center space-x-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-700/50 transition-all"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>GitHub Repo</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl glass-card p-8 border border-indigo-500/20 shadow-2xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Next.js Dashboard & Backend Express API Architecture</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise Authentication & Access Control Platform
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              AuthForge isolates core backend authentication logic on the Express server while offering npm package SDK integration for client applications.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                <span>NPM SDK Package</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-lg font-bold text-white">authforge-sdk</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-mono">v1.0.0 (Ready)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                <span>Server API Status</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-white capitalize">{serverStatus}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">Port 5000 / Express</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                <span>Security Engine</span>
                <Lock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-white">JWT + Bcrypt</div>
              <div className="text-[11px] text-slate-400 mt-1">HMAC SHA-256</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                <span>Database Engine</span>
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-white">MongoDB + Redis</div>
              <div className="text-[11px] text-slate-400 mt-1">Rate Limiting Active</div>
            </div>
          </div>
        </div>

        {/* Connection String & Credentials Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection String Card */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">SDK Connection String</h2>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">Project: default</span>
            </div>
            
            <p className="text-xs text-slate-400">
              Use this connection string to initialize `AuthForgeClient` in your applications.
            </p>

            <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
              <span className="truncate pr-4">{sampleConnString}</span>
              <button
                onClick={() => copyToClipboard(sampleConnString, "connStr")}
                className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-xs font-sans transition-all shrink-0 border border-indigo-500/30"
              >
                {copiedKey === "connStr" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "connStr" ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Individual API Keys */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[11px] text-slate-400 mb-1">API Key</div>
                <div className="font-mono text-xs text-slate-200 truncate">{sampleApiKey}</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[11px] text-slate-400 mb-1">API Secret</div>
                <div className="font-mono text-xs text-slate-200 truncate">{sampleApiSecret}</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[11px] text-slate-400 mb-1">Project ID</div>
                <div className="font-mono text-xs text-slate-200 truncate">{sampleProjectId}</div>
              </div>
            </div>
          </div>

          {/* Quick Package Install Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">NPM Installation</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Install the official lightweight SDK in any Node.js, Express, or Next.js app.
              </p>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
                <span>npm install authforge-sdk</span>
                <button
                  onClick={() => copyToClipboard("npm install authforge-sdk", "npmCmd")}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {copiedKey === "npmCmd" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero server bloat (3.6 kB package size)</span>
            </div>
          </div>
        </div>

        {/* Integration Code Showcase & Live Console */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Integration Tabs */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" /> SDK Code Integration
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
const authForge = new AuthForgeClient("${sampleConnString}");

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
  apiKey: "${sampleApiKey}",
  apiSecret: "${sampleApiSecret}",
  projectId: "${sampleProjectId}",
  host: "http://localhost:5000"
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

const authForge = new AuthForgeClient("${sampleConnString}");

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

          {/* Live Express API Server Tester */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-400" /> Live API Server Tester
                </h2>
                <span className="text-xs text-slate-400 font-mono">POST /api/auth/login</span>
              </div>

              <form onSubmit={handleTestApi} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Test Email</label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Test Password</label>
                  <input
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isTestingApi}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isTestingApi ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 fill-white" />
                  )}
                  <span>Send Request to Express Backend</span>
                </button>
              </form>

              {/* Response Log Window */}
              {apiResponse && (
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Server Response Log</div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {apiResponse}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-6 py-4 mt-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>AuthForge System &copy; 2026. Built with Express API & Next.js TypeScript.</div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> SDK Package Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
