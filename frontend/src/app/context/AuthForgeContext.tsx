"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useDashboardState } from "../hooks/useDashboardState";

type DashboardStateContextType = ReturnType<typeof useDashboardState>;

const AuthForgeContext = createContext<DashboardStateContextType | null>(null);

export function AuthForgeProvider({ children }: { children: ReactNode }) {
  const dashboardState = useDashboardState();

  return (
    <AuthForgeContext.Provider value={dashboardState}>
      {children}
    </AuthForgeContext.Provider>
  );
}

export function useAuthForge() {
  const context = useContext(AuthForgeContext);
  if (!context) {
    throw new Error("useAuthForge must be used within an AuthForgeProvider");
  }
  return context;
}
