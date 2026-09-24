"use client";

import React from "react";
import { Server, RefreshCw, Zap, ShieldCheck } from "lucide-react";
import { useAuthForge } from "../context/AuthForgeContext";

export default function ApiServerSandbox() {
  const {
    developerUser,
    selectedProject,
    apiTestMode,
    setApiTestMode,
    testEmail,
    setTestEmail,
    testPassword,
    setTestPassword,
    testName,
    setTestName,
    testUsername,
    setTestUsername,
    testResetToken,
    setTestResetToken,
    testNewPassword,
    setTestNewPassword,
    sdkTokenToVerify,
    setSdkTokenToVerify,
    apiResponse,
    isTestingApi,
    handleTestApi
  } = useAuthForge();

  // Hide Live API Server Sandbox when user is NOT logged in
  if (!developerUser) {
    return null;
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Title & Selected Project Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" /> Live API Server Sandbox
            </h2>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Project: <strong className="text-indigo-300">{selectedProject?.name || "Default"}</strong> ({selectedProject?.projectId || "proj_default"})</span>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 self-start sm:self-auto">
            {apiTestMode === "sdkRegister" && "POST /api/sdk/auth/register"}
            {apiTestMode === "sdkLogin" && "POST /api/sdk/auth/login"}
            {apiTestMode === "verifyToken" && "POST /api/sdk/verify-token"}
            {apiTestMode === "sdkInfo" && "GET /api/sdk/info"}
            {apiTestMode === "forgotPassword" && "POST /api/auth/forgot-password"}
            {apiTestMode === "resetPassword" && "POST /api/auth/reset-password"}
            {apiTestMode === "googleOAuth" && "GET /api/auth/google"}
            {apiTestMode === "login" && "POST /api/auth/login"}
            {apiTestMode === "register" && "POST /api/auth/register"}
          </span>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="space-y-2">
          <div>
            <div className="text-[10px] uppercase font-mono font-semibold text-slate-400 tracking-wider mb-1">SDK Application Routes</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setApiTestMode("sdkRegister")}
                className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                  apiTestMode === "sdkRegister" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                SDK Register
              </button>
              <button
                type="button"
                onClick={() => setApiTestMode("sdkLogin")}
                className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                  apiTestMode === "sdkLogin" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                SDK Login
              </button>
              <button
                type="button"
                onClick={() => setApiTestMode("verifyToken")}
                className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                  apiTestMode === "verifyToken" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Verify Token
              </button>
              <button
                type="button"
                onClick={() => setApiTestMode("sdkInfo")}
                className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                  apiTestMode === "sdkInfo" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                SDK Info
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono font-semibold text-slate-400 tracking-wider mb-1">Password & Security</div>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setApiTestMode("forgotPassword")}
                className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                  apiTestMode === "forgotPassword" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Forgot Pass
              </button>
              <button
                type="button"
                onClick={() => setApiTestMode("resetPassword")}
                className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                  apiTestMode === "resetPassword" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Reset Pass
              </button>
              <button
                type="button"
                onClick={() => setApiTestMode("googleOAuth")}
                className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                  apiTestMode === "googleOAuth" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Google OAuth
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleTestApi} className="space-y-3">
          {(apiTestMode === "sdkRegister" || apiTestMode === "register") && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  value={testUsername}
                  onChange={(e) => setTestUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {(apiTestMode === "sdkLogin" || apiTestMode === "sdkRegister" || apiTestMode === "login" || apiTestMode === "register" || apiTestMode === "forgotPassword") && (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {(apiTestMode === "sdkLogin" || apiTestMode === "sdkRegister" || apiTestMode === "login" || apiTestMode === "register") && (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {apiTestMode === "resetPassword" && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Password Reset Token</label>
                <input
                  type="text"
                  placeholder="Paste reset token here..."
                  value={testResetToken}
                  onChange={(e) => setTestResetToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password..."
                  value={testNewPassword}
                  onChange={(e) => setTestNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {apiTestMode === "verifyToken" && (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Access Token to Verify</label>
              <input
                type="text"
                placeholder="Paste JWT Access Token here..."
                value={sdkTokenToVerify}
                onChange={(e) => setSdkTokenToVerify(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {apiTestMode === "sdkInfo" && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
              <p className="text-slate-300 font-medium">Project Metadata Route</p>
              <p>Fetches public details for active project: <span className="text-indigo-400">{selectedProject?.projectId}</span></p>
            </div>
          )}

          {apiTestMode === "googleOAuth" && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="text-slate-300 font-medium">Google OAuth Direct Test</p>
              <p>Clicking the button below opens the Google OAuth consent flow directly in a popup window to trigger passport authentication on your Express server.</p>
            </div>
          )}

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
            <span>
              {apiTestMode === "sdkRegister" && `Register End-User for ${selectedProject?.name || "Project"}`}
              {apiTestMode === "sdkLogin" && `Login End-User for ${selectedProject?.name || "Project"}`}
              {apiTestMode === "verifyToken" && "Verify Access Token"}
              {apiTestMode === "sdkInfo" && "Fetch SDK Project Metadata"}
              {apiTestMode === "forgotPassword" && "Execute Forgot Password API"}
              {apiTestMode === "resetPassword" && "Execute Reset Password API"}
              {apiTestMode === "googleOAuth" && "Launch Google OAuth Popup"}
              {apiTestMode === "login" && "Execute Portal Login"}
              {apiTestMode === "register" && "Execute Portal Register"}
            </span>
          </button>
        </form>

        {/* Response Log Window */}
        {apiResponse && (
          <div className="space-y-1">
            <div className="text-[11px] text-slate-400 font-medium font-mono">Server Response Payload</div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
              {apiResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
