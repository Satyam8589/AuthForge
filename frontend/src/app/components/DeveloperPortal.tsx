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
  Users
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
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-400" /> Security Audit Log Stream
                </h3>
                <button
                  onClick={() => fetchAuditLogs()}
                  disabled={isLoadingAuditLogs}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAuditLogs ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>

              {auditLogs.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                  No security audit events recorded yet. Perform a login, key creation, or token refresh to see events here.
                </div>
              ) : (
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
                  {auditLogs.map((log: any, idx: number) => (
                    <div key={log._id || idx} className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        <div>
                          <span className="font-semibold text-slate-200 uppercase tracking-wide text-[11px]">{log.action}</span>
                          <span className="ml-2 text-[11px] text-slate-400">{log.ipAddress || log.ip || "127.0.0.1"}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </div>
                  ))}
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
