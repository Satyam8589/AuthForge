"use client";

import React from "react";
import { Server, RefreshCw, Zap } from "lucide-react";
import { useAuthForge } from "../context/AuthForgeContext";

export default function ApiServerSandbox() {
  const {
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
    apiResponse,
    isTestingApi,
    handleTestApi
  } = useAuthForge();

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" /> Live API Server Sandbox
          </h2>
          <span className="text-xs text-indigo-400 font-mono font-semibold">
            {apiTestMode === "login" && "POST /api/auth/login"}
            {apiTestMode === "register" && "POST /api/auth/register"}
            {apiTestMode === "forgotPassword" && "POST /api/auth/forgot-password"}
            {apiTestMode === "resetPassword" && "POST /api/auth/reset-password"}
            {apiTestMode === "googleOAuth" && "GET /api/auth/google"}
          </span>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setApiTestMode("login")}
            className={`py-1.5 px-2 rounded-lg transition-all text-center ${
              apiTestMode === "login" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setApiTestMode("register")}
            className={`py-1.5 px-2 rounded-lg transition-all text-center ${
              apiTestMode === "register" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setApiTestMode("forgotPassword")}
            className={`py-1.5 px-2 rounded-lg transition-all text-center ${
              apiTestMode === "forgotPassword" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            Forgot Pass
          </button>
          <button
            type="button"
            onClick={() => setApiTestMode("resetPassword")}
            className={`py-1.5 px-2 rounded-lg transition-all text-center ${
              apiTestMode === "resetPassword" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            Reset Pass
          </button>
          <button
            type="button"
            onClick={() => setApiTestMode("googleOAuth")}
            className={`py-1.5 px-2 rounded-lg transition-all text-center col-span-2 sm:col-span-1 ${
              apiTestMode === "googleOAuth" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            Google OAuth
          </button>
        </div>

        <form onSubmit={handleTestApi} className="space-y-3">
          {apiTestMode === "register" && (
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

          {(apiTestMode === "login" || apiTestMode === "register" || apiTestMode === "forgotPassword") && (
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

          {(apiTestMode === "login" || apiTestMode === "register") && (
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
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Reset Token</label>
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
                  value={testNewPassword}
                  onChange={(e) => setTestNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
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
              {apiTestMode === "login" && "Execute Login API"}
              {apiTestMode === "register" && "Execute Register API"}
              {apiTestMode === "forgotPassword" && "Execute Forgot Password API"}
              {apiTestMode === "resetPassword" && "Execute Reset Password API"}
              {apiTestMode === "googleOAuth" && "Launch Google OAuth Popup"}
            </span>
          </button>
        </form>

        {/* Response Log Window */}
        {apiResponse && (
          <div className="space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Server Response Payload</div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-44 overflow-y-auto whitespace-pre-wrap">
              {apiResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
