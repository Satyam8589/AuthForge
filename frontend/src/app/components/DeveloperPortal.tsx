"use client";

import React from "react";
import { 
  Key, 
  UserPlus, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  FolderPlus, 
  RotateCw, 
  Trash2, 
  Copy, 
  Check, 
  ShieldAlert, 
  Zap,
  Users,
  ChevronDown,
  ChevronUp,
  Filter,
  Clock,
  XCircle,
  Info,
  Shield
} from "lucide-react";
import { useAuthForge } from "../context/AuthForgeContext";

export interface Project {
  _id: string;
  name: string;
  projectId: string;
  apiKey: string;
  apiSecret: string;
  connectionString: string;
  allowedOrigins: string[];
  createdAt: string;
}

export default function DeveloperPortal() {
  const {
    developerToken,
    developerUser,
    authMode,
    setAuthMode,
    devName,
    setDevName,
    devEmail,
    setDevEmail,
    devPassword,
    setDevPassword,
    devAuthLoading,
    devAuthMsg,
    handleDeveloperAuth,
    handleGoogleLogin,
    handleLogout,
    handleLogoutAll,
    projects,
    selectedProject,
    setSelectedProject,
    newProjectName,
    setNewProjectName,
    isCreatingProject,
    handleCreateProject,
    handleRotateSecret,
    handleDeleteProject,
    currentConnString,
    currentApiKey,
    currentApiSecret,
    currentProjectId,
    copiedKey,
    copyToClipboard,
    activePortalTab,
    setActivePortalTab,
    projectUsers,
    totalProjectUsers,
    isLoadingProjectUsers,
    fetchProjectUsers,
    auditLogs,
    isLoadingAuditLogs,
    fetchAuditLogs,
    sdkTokenToVerify,
    setSdkTokenToVerify,
    sdkVerificationResult,
    isVerifyingSdkToken,
    handleSdkVerifyToken
  } = useAuthForge();

  const [auditStatusFilter, setAuditStatusFilter] = React.useState<"ALL" | "GREEN" | "RED" | "YELLOW">("ALL");
  const [expandedLogId, setExpandedLogId] = React.useState<string | null>(null);
  const [auditProjectFilter, setAuditProjectFilter] = React.useState<string>("ALL");
  const [sdkSnippetTab, setSdkSnippetTab] = React.useState<"quickstart" | "authFlow" | "middleware">("quickstart");

  React.useEffect(() => {
    if (activePortalTab === "audit") {
      fetchAuditLogs(undefined, auditProjectFilter === "ALL" ? "" : auditProjectFilter);
    }
  }, [activePortalTab, auditProjectFilter]);

  const getAuditLogCategory = (action: string) => {
    const act = (action || "").toUpperCase();
    if (
      [
        "LOGIN_SUCCESS",
        "REGISTER",
        "TOKEN_VERIFIED",
        "PASSWORD_RESET_COMPLETED",
        "PROJECT_CREATED",
        "EMAIL_VERIFIED",
        "ACCOUNT_UNLOCKED"
      ].includes(act)
    ) {
      return {
        category: "GREEN",
        badgeCss: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        dotCss: "bg-emerald-500 shadow-sm shadow-emerald-500/50",
        label: "GREEN • SUCCESS",
        icon: CheckCircle2,
        getTitle: (log: any) => {
          if (act === "LOGIN_SUCCESS") return `User ${log.details?.email || ""} Logged In Successfully`;
          if (act === "REGISTER") return `New User ${log.details?.email || ""} Registered`;
          if (act === "TOKEN_VERIFIED") return `SDK Bearer Token Verified Successfully`;
          if (act === "PASSWORD_RESET_COMPLETED") return `Password Reset Completed for ${log.details?.email || ""}`;
          if (act === "PROJECT_CREATED") return `Project "${log.details?.projectName || log.details?.projectId}" Created`;
          return act.replace(/_/g, " ");
        }
      };
    }
    if (
      [
        "LOGIN_FAILED",
        "TOKEN_INVALID",
        "PROJECT_DELETED",
        "KEYS_ROTATED",
        "ACCOUNT_LOCKED",
        "USER_DELETED"
      ].includes(act)
    ) {
      return {
        category: "RED",
        badgeCss: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        dotCss: "bg-rose-500 shadow-sm shadow-rose-500/50",
        label: "RED • ALERT / FAILED",
        icon: ShieldAlert,
        getTitle: (log: any) => {
          if (act === "LOGIN_FAILED") return `Login Failed: ${log.details?.reason || "Invalid Credentials"} (${log.details?.email || "User"})`;
          if (act === "TOKEN_INVALID") return `SDK Token Verification Failed: ${log.details?.reason || "Invalid Token"}`;
          if (act === "KEYS_ROTATED") return `API Secret Regenerated for Project ${log.details?.projectId || ""}`;
          if (act === "PROJECT_DELETED") return `Project ${log.details?.projectId || ""} Deleted`;
          return act.replace(/_/g, " ");
        }
      };
    }
    // Default: YELLOW
    return {
      category: "YELLOW",
      badgeCss: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      dotCss: "bg-amber-400 shadow-sm shadow-amber-400/50",
      label: "YELLOW • ATTEMPT / NOTICE",
      icon: AlertCircle,
      getTitle: (log: any) => {
        if (act === "LOGIN_ATTEMPT") return `User ${log.details?.email || ""} Initiated Login Request`;
        if (act === "LOGOUT") return `User Logged Out`;
        if (act === "LOGOUT_ALL") return `User Logged Out From All Devices`;
        if (act === "PASSWORD_RESET_REQUESTED") return `Password Reset Requested for ${log.details?.email || ""}`;
        if (act === "TOKEN_REFRESHED") return `Auth Session Token Refreshed`;
        return act.replace(/_/g, " ");
      }
    };
  };

  const greenLogsCount = auditLogs.filter(l => getAuditLogCategory(l.action).category === "GREEN").length;
  const redLogsCount = auditLogs.filter(l => getAuditLogCategory(l.action).category === "RED").length;
  const yellowLogsCount = auditLogs.filter(l => getAuditLogCategory(l.action).category === "YELLOW").length;

  const filteredLogs = auditLogs.filter((log: any) => {
    const info = getAuditLogCategory(log.action);
    if (auditStatusFilter !== "ALL" && info.category !== auditStatusFilter) {
      return false;
    }
    if (auditProjectFilter !== "ALL" && (log.details?.projectId || "default") !== auditProjectFilter) {
      return false;
    }
    return true;
  });

  return (
    <div id="dev-portal" className="glass-card p-6 rounded-2xl border border-indigo-500/30 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-400" /> Developer Portal & Project Keys
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Register an account to generate real backend API keys and connection strings.
          </p>
        </div>

        {/* Account Status / Mode Toggle */}
        {!developerToken ? (
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setAuthMode("register")}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                authMode === "register" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Register
            </button>
            <button
              onClick={() => setAuthMode("login")}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                authMode === "login" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Login
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-300">
              Signed in as <strong className="text-indigo-400">{developerUser?.email}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-xs border border-rose-500/20 transition-all flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        )}
      </div>

      {!developerToken ? (
        /* Developer Registration / Login Form */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-200">
              {authMode === "register" ? "Create your Developer Account" : "Sign into Developer Portal"}
            </h3>

            {devAuthMsg && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                devAuthMsg.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                {devAuthMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{devAuthMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleDeveloperAuth} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Developer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="developer@example.com"
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={devPassword}
                  onChange={(e) => setDevPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={devAuthLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {devAuthLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : authMode === "register" ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{authMode === "register" ? "Create Account & Generate Keys" : "Sign In to Access Projects"}</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-950 px-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold absolute">Or</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2.5 transition-all shadow-sm hover:border-slate-600"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          </div>

          {/* Informational Panel */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4 text-xs text-slate-400">
            <div className="text-slate-200 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              How Connection Keys Work in AuthForge
            </div>
            <ul className="space-y-2.5 list-disc list-inside text-slate-300">
              <li>Registration sends a call to <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">POST /api/auth/register</code> on your backend server.</li>
              <li>Upon logging in, a new project can be created with one click.</li>
              <li>The Express server uses <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">crypto.randomBytes()</code> to generate your unique <code className="text-emerald-400">apiKey</code> and <code className="text-amber-400">apiSecret</code>.</li>
              <li>Your connection string formatted as <code className="text-purple-300">authforge://KEY:SECRET@PROJECT_ID</code> can be copied directly into your code.</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Logged In Developer Dashboard */
        <div className="space-y-6">
          {/* Developer Portal Tab Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActivePortalTab("keys")}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activePortalTab === "keys" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-white"
                }`}
              >
                <Key className="w-3.5 h-3.5" /> Keys & Projects
              </button>
              <button
                onClick={() => {
                  setActivePortalTab("users");
                  if (selectedProject?.projectId) fetchProjectUsers(selectedProject.projectId);
                }}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activePortalTab === "users" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" /> App End-Users ({totalProjectUsers})
              </button>
              <button
                onClick={() => {
                  setActivePortalTab("audit");
                  fetchAuditLogs();
                }}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activePortalTab === "audit" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-white"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Audit Logs ({auditLogs.length})
              </button>
              <button
                onClick={() => setActivePortalTab("sdkTester")}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activePortalTab === "sdkTester" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> SDK Token Verifier
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleLogoutAll}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-xs border border-rose-500/20 transition-all flex items-center gap-1.5"
                title="Revoke session tokens across all signed-in devices"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Revoke All Sessions
              </button>
            </div>
          </div>

          {/* TAB 1: KEYS & PROJECTS MANAGEMENT */}
          {activePortalTab === "keys" && (
            <div className="space-y-6">
              {/* Project Selector & Creator Header */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400 font-medium">Select Project:</span>
                  {projects.length > 0 ? (
                    <select
                      value={selectedProject?.projectId || ""}
                      onChange={(e) => {
                        const proj = projects.find((p) => p.projectId === e.target.value);
                        if (proj) setSelectedProject(proj);
                      }}
                      className="bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      {projects.map((p) => (
                        <option key={p.projectId} value={p.projectId}>
                          {p.name} ({p.projectId})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No projects yet. Create your first project below.</span>
                  )}
                </div>

                {/* Create Project Inline Form */}
                <form onSubmit={handleCreateProject} className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="New Project Name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isCreatingProject}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all disabled:opacity-50"
                  >
                    {isCreatingProject ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
                    <span>Create Project</span>
                  </button>
                </form>
              </div>

              {/* Active Connection Keys Display */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-400" /> Active Connection String ({selectedProject?.name || "Sample"})
                  </h3>
                  {selectedProject && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleRotateSecret(selectedProject.projectId)}
                        className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20"
                      >
                        <RotateCw className="w-3 h-3" /> Rotate Secret
                      </button>
                      <button
                        onClick={() => handleDeleteProject(selectedProject.projectId)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20"
                      >
                        <Trash2 className="w-3 h-3" /> Delete Project
                      </button>
                    </div>
                  )}
                </div>

                {/* Connection String Bar */}
                <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                  <span className="truncate pr-4">{currentConnString}</span>
                  <button
                    onClick={() => copyToClipboard(currentConnString, "devConnStr")}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-xs font-sans transition-all shrink-0 border border-indigo-500/30"
                  >
                    {copiedKey === "devConnStr" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "devConnStr" ? "Copied" : "Copy String"}</span>
                  </button>
                </div>

                {/* Individual Keys Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>API Key</span>
                      <button onClick={() => copyToClipboard(currentApiKey, "devApiKey")} className="hover:text-white">
                        {copiedKey === "devApiKey" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="font-mono text-xs text-emerald-400 truncate font-semibold">{currentApiKey}</div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>API Secret</span>
                      <button onClick={() => copyToClipboard(currentApiSecret, "devApiSecret")} className="hover:text-white">
                        {copiedKey === "devApiSecret" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="font-mono text-xs text-purple-400 truncate font-semibold">{currentApiSecret}</div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Project ID</span>
                      <button onClick={() => copyToClipboard(currentProjectId, "devProjectId")} className="hover:text-white">
                        {copiedKey === "devProjectId" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="font-mono text-xs text-indigo-300 truncate font-semibold">{currentProjectId}</div>
                  </div>
                </div>

                {/* Project Registered Users Summary Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Registered End-Users for <span className="text-white font-medium">{selectedProject?.name || "Selected Project"}</span></div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">{totalProjectUsers} Users</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActivePortalTab("users");
                      if (selectedProject?.projectId) fetchProjectUsers(selectedProject.projectId);
                    }}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/30 transition-all flex items-center gap-1.5"
                  >
                    <span>View User Directory</span>
                    <Users className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* SDK Integration Snippet & Instructions Section */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-400" /> SDK Integration Snippet & Easy Setup Instructions
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Follow these simple steps to integrate AuthForge into your custom frontend & backend app.
                      </p>
                    </div>

                    {/* Code Snippet Subtabs */}
                    <div className="flex space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
                      <button
                        onClick={() => setSdkSnippetTab("quickstart")}
                        className={`px-3 py-1 rounded-lg font-medium transition-all ${
                          sdkSnippetTab === "quickstart" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        1. Quickstart & Client
                      </button>
                      <button
                        onClick={() => setSdkSnippetTab("authFlow")}
                        className={`px-3 py-1 rounded-lg font-medium transition-all ${
                          sdkSnippetTab === "authFlow" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        2. Auth Methods Flow
                      </button>
                      <button
                        onClick={() => setSdkSnippetTab("middleware")}
                        className={`px-3 py-1 rounded-lg font-medium transition-all ${
                          sdkSnippetTab === "middleware" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        3. Express Middleware
                      </button>
                    </div>
                  </div>

                  {/* Step 1: Install Package Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800 gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">1</span>
                      <span className="text-xs text-slate-300 font-medium">Install official NPM package:</span>
                      <code className="text-xs font-mono text-emerald-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">npm install authforge-sdk</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard("npm install authforge-sdk", "npmInstallCmd")}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition-colors"
                    >
                      {copiedKey === "npmInstallCmd" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "npmInstallCmd" ? "Copied Command" : "Copy Command"}</span>
                    </button>
                  </div>

                  {/* Code Snippet Box */}
                  <div className="relative group">
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={() => {
                          const codeToCopy =
                            sdkSnippetTab === "quickstart"
                              ? `import { AuthForge } from "authforge-sdk";\n\n// Initialize AuthForge Client for ${selectedProject?.name || "App"}\nexport const authforge = new AuthForge({\n  connectionString: "${currentConnString}"\n});`
                              : sdkSnippetTab === "authFlow"
                              ? `import { authforge } from "./authforge";\n\n// 1. LOGIN WITH EMAIL & PASSWORD\nasync function handleUserLogin(email, password) {\n  const res = await authforge.login({ email, password });\n  return res.user;\n}\n\n// 2. REGISTER NEW END-USER\nasync function handleUserRegister(name, username, email, password) {\n  const res = await authforge.register({ name, username, email, password });\n  return res;\n}\n\n// 3. FORGOT PASSWORD REQUEST\nasync function handleForgotPassword(email) {\n  const res = await authforge.forgotPassword(email);\n  return res;\n}\n\n// 4. RESET PASSWORD WITH TOKEN FROM EMAIL\nasync function handleResetPassword(token, newPassword) {\n  const res = await authforge.resetPassword(token, newPassword);\n  return res;\n}`
                              : `import express from "express";\nimport { AuthForge } from "authforge-sdk";\n\nconst app = express();\nconst authforge = new AuthForge({\n  connectionString: "${currentConnString}"\n});\n\n// Protect API endpoint - verifies Bearer JWT token against AuthForge project ${currentProjectId}\napp.get("/api/user-profile", authforge.middleware(), (req, res) => {\n  res.json({ message: "Access granted", user: req.user });\n});`;

                          copyToClipboard(codeToCopy, `snippet_${sdkSnippetTab}`);
                        }}
                        className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 rounded-lg text-xs font-medium border border-indigo-500/40 transition-all flex items-center gap-1.5 shadow-md"
                      >
                        {copiedKey === `snippet_${sdkSnippetTab}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === `snippet_${sdkSnippetTab}` ? "Copied Snippet" : "Copy Code Snippet"}</span>
                      </button>
                    </div>

                    {sdkSnippetTab === "quickstart" && (
                      <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                        <span className="text-slate-500">// Step 2: Initialize AuthForge Client with your pre-configured Connection String</span>{"\n"}
                        <span className="text-purple-400">import</span> {"{"} AuthForge {"}"} <span className="text-purple-400">from</span> <span className="text-emerald-300">"authforge-sdk"</span>;{"\n\n"}
                        <span className="text-purple-400">export const</span> <span className="text-amber-300">authforge</span> = <span className="text-purple-400">new</span> <span className="text-indigo-400">AuthForge</span>({"{\n"}
                        {"  "}connectionString: <span className="text-emerald-300">"{currentConnString}"</span>{"\n"}
                        {"}"});{"\n\n"}
                        <span className="text-slate-500">// Alternatively, initialize using individual keys:</span>{"\n"}
                        <span className="text-slate-500">// export const authforge = new AuthForge({"{"}</span>{"\n"}
                        <span className="text-slate-500">//   apiKey: "{currentApiKey}",</span>{"\n"}
                        <span className="text-slate-500">//   apiSecret: "{currentApiSecret}",</span>{"\n"}
                        <span className="text-slate-500">//   projectId: "{currentProjectId}"</span>{"\n"}
                        <span className="text-slate-500">// {"}"});</span>
                      </pre>
                    )}

                    {sdkSnippetTab === "authFlow" && (
                      <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                        <span className="text-purple-400">import</span> {"{"} authforge {"}"} <span className="text-purple-400">from</span> <span className="text-emerald-300">"./authforge"</span>;{"\n\n"}
                        <span className="text-slate-500">// 1. LOGIN WITH EMAIL & PASSWORD (Inside your custom Login form onSubmit)</span>{"\n"}
                        <span className="text-purple-400">async function</span> <span className="text-indigo-400">handleUserLogin</span>(email, password) {"{\n"}
                        {"  "}<span className="text-purple-400">try</span> {"{\n"}
                        {"    "}<span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> authforge.<span className="text-amber-300">login</span>({"{"} email, password {"}"});{"\n"}
                        {"    "}console.<span className="text-indigo-300">log</span>(<span className="text-emerald-300">"User logged in! Token:"</span>, res.accessToken);{"\n"}
                        {"    "}<span className="text-purple-400">return</span> res.user;{"\n"}
                        {"  }"} <span className="text-purple-400">catch</span> (err) {"{\n"}
                        {"    "}console.<span className="text-rose-400">error</span>(<span className="text-rose-300">"Login failed:"</span>, err.message);{"\n"}
                        {"  }"}\n{"}"}{"\n\n"}
                        <span className="text-slate-500">// 2. REGISTER NEW USER</span>{"\n"}
                        <span className="text-purple-400">async function</span> <span className="text-indigo-400">handleUserRegister</span>(name, username, email, password) {"{\n"}
                        {"  "}<span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> authforge.<span className="text-amber-300">register</span>({"{"} name, username, email, password {"}"});{"\n"}
                        {"  "}<span className="text-purple-400">return</span> res.data;{"\n"}
                        {"}"}{"\n\n"}
                        <span className="text-slate-500">// 3. FORGOT PASSWORD (Send reset link to user's email)</span>{"\n"}
                        <span className="text-purple-400">async function</span> <span className="text-indigo-400">handleForgotPassword</span>(email) {"{\n"}
                        {"  "}<span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> authforge.<span className="text-amber-300">forgotPassword</span>(email);{"\n"}
                        {"  "}alert(res.message); <span className="text-slate-500">// "Password reset instructions sent"</span>{"\n"}
                        {"}"}{"\n\n"}
                        <span className="text-slate-500">// 4. RESET PASSWORD WITH TOKEN FROM EMAIL</span>{"\n"}
                        <span className="text-purple-400">async function</span> <span className="text-indigo-400">handleResetPassword</span>(token, newPassword) {"{\n"}
                        {"  "}<span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> authforge.<span className="text-amber-300">resetPassword</span>(token, newPassword);{"\n"}
                        {"  "}alert(<span className="text-emerald-300">"Password updated! Please login."</span>);{"\n"}
                        {"}"}
                      </pre>
                    )}

                    {sdkSnippetTab === "middleware" && (
                      <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                        <span className="text-slate-500">// Node.js / Express Server: Protect your private API endpoints</span>{"\n"}
                        <span className="text-purple-400">import</span> express <span className="text-purple-400">from</span> <span className="text-emerald-300">"express"</span>;{"\n"}
                        <span className="text-purple-400">import</span> {"{"} AuthForge {"}"} <span className="text-purple-400">from</span> <span className="text-emerald-300">"authforge-sdk"</span>;{"\n\n"}
                        <span className="text-purple-400">const</span> app = <span className="text-indigo-400">express</span>();{"\n"}
                        <span className="text-purple-400">const</span> authforge = <span className="text-purple-400">new</span> <span className="text-indigo-400">AuthForge</span>({"{\n"}
                        {"  "}connectionString: <span className="text-emerald-300">"{currentConnString}"</span>{"\n"}
                        {"}"});{"\n\n"}
                        <span className="text-slate-500">// Middleware automatically verifies Bearer JWT token & attaches req.user</span>{"\n"}
                        app.<span className="text-amber-300">get</span>(<span className="text-emerald-300">"/api/protected-profile"</span>, authforge.<span className="text-amber-300">middleware</span>(), (req, res) =&gt; {"{\n"}
                        {"  "}res.<span className="text-indigo-300">json</span>({"{\n"}
                        {"    "}message: <span className="text-emerald-300">"Access granted!"</span>,{"\n"}
                        {"    "}user: req.user <span className="text-slate-500">// Authenticated user object</span>{"\n"}
                        {"  }"});{"\n"}
                        {"}"});
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECT END-USERS DIRECTORY */}
          {activePortalTab === "users" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" /> Registered Application Users ({totalProjectUsers})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    End-users who authenticated or registered in your application using project key <code className="text-indigo-300 font-mono">{selectedProject?.projectId}</code>.
                  </p>
                </div>

                <button
                  onClick={() => selectedProject?.projectId && fetchProjectUsers(selectedProject.projectId)}
                  disabled={isLoadingProjectUsers}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProjectUsers ? "animate-spin" : ""}`} /> Refresh Users
                </button>
              </div>

              {projectUsers.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                  <Users className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-300 font-medium">No registered end-users for {selectedProject?.name || "this project"} yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Use the SDK integration in your app or test <code className="text-indigo-400">POST /api/sdk/auth/register</code> in the Live API Server Sandbox to register users under key <span className="font-mono text-emerald-400">{selectedProject?.apiKey}</span>.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      <tr>
                        <th className="px-4 py-3">Full Name</th>
                        <th className="px-4 py-3">Username</th>
                        <th className="px-4 py-3">Email Address</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Registered Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {projectUsers.map((usr: any) => (
                        <tr key={usr._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3 font-sans font-medium text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                              {(usr.name || usr.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <span>{usr.name}</span>
                          </td>
                          <td className="px-4 py-3 text-indigo-300">@{usr.username}</td>
                          <td className="px-4 py-3 text-slate-200">{usr.email}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {usr.role || "USER"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-[11px]">
                            {new Date(usr.createdAt || Date.now()).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SECURITY & AUDIT LOGS */}
          {activePortalTab === "audit" && (
            <div className="space-y-5">
              {/* Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-purple-400 animate-pulse" /> Security Audit Log Stream
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time event trail capturing logins, registration, password resets, SDK token verifications, and key activities.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Project Selector Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    <select
                      value={auditProjectFilter}
                      onChange={(e) => setAuditProjectFilter(e.target.value)}
                      className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
                    >
                      <option value="ALL" className="bg-slate-900 text-slate-200">All Project Keys</option>
                      {projects.map((p) => (
                        <option key={p.projectId} value={p.projectId} className="bg-slate-900 text-slate-200">
                          {p.name} ({p.projectId.substring(0, 10)}...)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => fetchAuditLogs(undefined, auditProjectFilter === "ALL" ? "" : auditProjectFilter)}
                    disabled={isLoadingAuditLogs}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAuditLogs ? "animate-spin" : ""}`} /> Refresh
                  </button>
                </div>
              </div>

              {/* Status Color Category Summary Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => setAuditStatusFilter("ALL")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    auditStatusFilter === "ALL"
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                      : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">All Events</div>
                  <div className="text-lg font-bold text-white mt-0.5">{auditLogs.length}</div>
                </button>

                <button
                  onClick={() => setAuditStatusFilter("GREEN")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    auditStatusFilter === "GREEN"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10"
                      : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-emerald-500/40"
                  }`}
                >
                  <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                    Green (Success)
                  </div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{greenLogsCount}</div>
                </button>

                <button
                  onClick={() => setAuditStatusFilter("RED")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    auditStatusFilter === "RED"
                      ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10"
                      : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-rose-500/40"
                  }`}
                >
                  <div className="text-[11px] font-medium text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                    Red (Failed / Alert)
                  </div>
                  <div className="text-lg font-bold text-rose-400 mt-0.5">{redLogsCount}</div>
                </button>

                <button
                  onClick={() => setAuditStatusFilter("YELLOW")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    auditStatusFilter === "YELLOW"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10"
                      : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-amber-500/40"
                  }`}
                >
                  <div className="text-[11px] font-medium text-amber-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
                    Yellow (Attempt)
                  </div>
                  <div className="text-lg font-bold text-amber-300 mt-0.5">{yellowLogsCount}</div>
                </button>
              </div>

              {/* Audit Log Stream List */}
              {filteredLogs.length === 0 ? (
                <div className="p-10 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
                  <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-semibold text-slate-300 text-sm">No security audit events found matching filters.</p>
                  <p className="text-slate-500">
                    Try changing status filters or perform a user login, password reset, or token verification.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log: any, idx: number) => {
                    const info = getAuditLogCategory(log.action);
                    const IconComponent = info.icon;
                    const isExpanded = expandedLogId === (log._id || String(idx));
                    const logProjectId = log.details?.projectId || "default";

                    return (
                      <div
                        key={log._id || idx}
                        className={`bg-slate-950/90 rounded-2xl border transition-all overflow-hidden ${
                          info.category === "GREEN"
                            ? "border-emerald-500/20 hover:border-emerald-500/40"
                            : info.category === "RED"
                            ? "border-rose-500/20 hover:border-rose-500/40"
                            : "border-amber-500/20 hover:border-amber-500/40"
                        }`}
                      >
                        {/* Main Summary Row */}
                        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-start gap-3">
                            {/* Color Dot & Icon */}
                            <div className="mt-0.5 flex-shrink-0 flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${info.dotCss}`}></span>
                              <div className={`p-1.5 rounded-lg ${info.badgeCss}`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                            </div>

                            {/* Event Info */}
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Color Status Sign Badge */}
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${info.badgeCss}`}>
                                  {info.label}
                                </span>

                                {/* Action Code Pill */}
                                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800">
                                  {log.action}
                                </span>

                                {/* Project Key Pill */}
                                {logProjectId && (
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
                                    Key: {logProjectId}
                                  </span>
                                )}
                              </div>

                              {/* Human-readable event description */}
                              <h4 className="text-xs font-semibold text-white">
                                {info.getTitle(log)}
                              </h4>

                              {/* User Email & IP details */}
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                                {log.details?.email && (
                                  <span className="flex items-center gap-1 text-slate-300">
                                    <Users className="w-3 h-3 text-slate-400" />
                                    {log.details.email}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-slate-400 font-mono">
                                  IP: {log.ipAddress || log.ip || "127.0.0.1"}
                                </span>
                                {log.userAgent && (
                                  <span className="text-slate-500 text-[10px] truncate max-w-[200px]" title={log.userAgent}>
                                    {log.userAgent}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Time & Details Toggle */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-900 pt-2 sm:pt-0 gap-2 flex-shrink-0">
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {new Date(log.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              <span className="text-slate-600">•</span>
                              {new Date(log.createdAt || Date.now()).toLocaleDateString()}
                            </div>

                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : (log._id || String(idx)))}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" /> Hide Raw JSON
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" /> View Raw Details
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Raw Payload Drawer */}
                        {isExpanded && (
                          <div className="p-3 bg-slate-900/90 border-t border-slate-800/80">
                            <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                              <span>Full Event Payload Object</span>
                              <span>ID: {log._id || "N/A"}</span>
                            </div>
                            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                              {JSON.stringify(log, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SDK TOKEN VERIFIER SANDBOX */}
          {activePortalTab === "sdkTester" && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" /> Live SDK Middleware Token Verifier
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Paste any JWT token generated by your user authentication flow to verify it against the <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">POST /api/sdk/verify-token</code> middleware.
                </p>
              </div>

              <form onSubmit={handleSdkVerifyToken} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">User Bearer JWT Token</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Paste JWT token here..."
                    value={sdkTokenToVerify}
                    onChange={(e) => setSdkTokenToVerify(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingSdkToken}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isVerifyingSdkToken ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Verify Token with SDK Middleware</span>
                </button>
              </form>

              {sdkVerificationResult && (
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">SDK Verification Output</div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {sdkVerificationResult}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
