"use client";

import React from "react";

export default function Footer() {
  return (
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
  );
}
