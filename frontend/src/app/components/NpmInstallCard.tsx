"use client";

import React from "react";
import { Terminal, Check, Copy, CheckCircle2 } from "lucide-react";
import { useAuthForge } from "../context/AuthForgeContext";

export default function NpmInstallCard() {
  const { copiedKey, copyToClipboard } = useAuthForge();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">NPM Installation & SDK Usage</h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Install the official lightweight SDK in any Node.js, Express, or Next.js app, then paste your connection string.
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

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SDK Compatibility
          </div>
          <p className="text-xs text-slate-400">
            Supports CommonJS, ES Modules (`import`), TypeScript types, Express middleware, and Next.js App Router.
          </p>
        </div>
        <div className="pt-2 text-xs text-emerald-400 font-mono">
          Package Size: 3.6 kB
        </div>
      </div>
    </div>
  );
}
