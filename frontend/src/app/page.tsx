"use client";

import React from "react";
import { AuthForgeProvider } from "./context/AuthForgeContext";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import DeveloperPortal from "./components/DeveloperPortal";
import NpmInstallCard from "./components/NpmInstallCard";
import CodeIntegrationTabs from "./components/CodeIntegrationTabs";
import ApiServerSandbox from "./components/ApiServerSandbox";
import Footer from "./components/Footer";

export default function AuthForgeDashboard() {
  return (
    <AuthForgeProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
          <HeroSection />
          <DeveloperPortal />
          <NpmInstallCard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CodeIntegrationTabs />
            <ApiServerSandbox />
          </div>
        </main>

        <Footer />
      </div>
    </AuthForgeProvider>
  );
}
