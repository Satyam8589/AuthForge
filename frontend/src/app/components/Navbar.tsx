"use client";

import React from "react";
import { 
  ShieldCheck, 
  Server, 
  RefreshCw, 
  UserCheck, 
  LogOut, 
  Key 
} from "lucide-react";
import { useAuthForge } from "../context/AuthForgeContext";

export default function Navbar() {
  const {
    serverStatus,
    serverLatency,
    checkServerHealth,
    developerUser,
    handleLogout
  } = useAuthForge();

  return (
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

        {/* Backend Health Status Badge & Dev User */}
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
                Offline
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

          {developerUser ? (
            <div className="flex items-center space-x-2 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1.5 rounded-lg text-xs">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-200 font-medium">{developerUser.name}</span>
              <button
                onClick={handleLogout}
                className="ml-2 text-slate-400 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <a
              href="#dev-portal"
              className="flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-lg transition-all shadow-md shadow-indigo-600/20"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Developer Keys</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
