"use client";

import React from "react";
import { Zap, Layers, Activity, Lock, Cpu } from "lucide-react";
import { useAuthForge } from "../context/AuthForgeContext";

export default function HeroSection() {
  const {
    API_BASE_URL,
    serverStatus,
    developerToken,
    projects
  } = useAuthForge();

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card p-8 border border-indigo-500/20 shadow-2xl">
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-4 max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Developer Registration & Connection Key Generator</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Register & Manage SDK Connection Keys
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Create a developer account below to generate real API keys, secrets, and connection strings directly from your Express backend server.
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
            <span>Server API Target</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xs font-bold text-white truncate">{API_BASE_URL}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Status: {serverStatus}</div>
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
            <span>Active Projects</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white">{developerToken ? projects.length : "Demo Mode"}</div>
          <div className="text-[11px] text-slate-400 mt-1">{developerToken ? "Connected" : "Sign in to view"}</div>
        </div>
      </div>
    </div>
  );
}
