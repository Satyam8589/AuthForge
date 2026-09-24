"use client";

import { useState, useEffect } from "react";
import { Project } from "../components/DeveloperPortal";

export function useDashboardState() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [serverLatency, setServerLatency] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"express" | "nextjs" | "react" | "sdk">("express");

  // Dynamic API Base URL (Vercel production or local Express server)
  const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  // Developer Authentication & Projects state
  const [developerToken, setDeveloperToken] = useState<string | null>(null);
  const [developerUser, setDeveloperUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  
  // Auth Form State
  const [devName, setDevName] = useState("");
  const [devEmail, setDevEmail] = useState("");
  const [devPassword, setDevPassword] = useState("");
  const [devAuthLoading, setDevAuthLoading] = useState(false);
  const [devAuthMsg, setDevAuthMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Projects, End-Users & Audit Logs State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectUsers, setProjectUsers] = useState<any[]>([]);
  const [totalProjectUsers, setTotalProjectUsers] = useState<number>(0);
  const [isLoadingProjectUsers, setIsLoadingProjectUsers] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState<"keys" | "users" | "audit" | "sdkTester">("keys");
  const [sdkTokenToVerify, setSdkTokenToVerify] = useState("");
  const [sdkVerificationResult, setSdkVerificationResult] = useState<string | null>(null);
  const [isVerifyingSdkToken, setIsVerifyingSdkToken] = useState(false);

  // Comprehensive Live API Tester State
  const [apiTestMode, setApiTestMode] = useState<"sdkRegister" | "sdkLogin" | "verifyToken" | "sdkInfo" | "login" | "register" | "forgotPassword" | "resetPassword" | "googleOAuth">("sdkRegister");
  const [testEmail, setTestEmail] = useState("user@example.com");
  const [testPassword, setTestPassword] = useState("Password123!");
  const [testName, setTestName] = useState("John Doe");
  const [testUsername, setTestUsername] = useState("johndoe123");
  const [testResetToken, setTestResetToken] = useState("");
  const [testNewPassword, setTestNewPassword] = useState("NewPassword123!");
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Check saved session in localStorage & handle Google OAuth listener
  useEffect(() => {
    const savedToken = localStorage.getItem("af_dev_token");
    const savedUser = localStorage.getItem("af_dev_user");
    if (savedToken && savedUser) {
      try {
        setDeveloperToken(savedToken);
        setDeveloperUser(JSON.parse(savedUser));
        fetchUserProjects(savedToken);
        fetchAuditLogs(savedToken);
      } catch {
        localStorage.removeItem("af_dev_token");
        localStorage.removeItem("af_dev_user");
      }
    }

    // Google OAuth Popup message listener
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "oauth-success") {
        const token = event.data.accessToken || event.data.data?.accessToken;
        const user = event.data.user || event.data.data?.user;
        if (token) {
          setDeveloperToken(token);
          setDeveloperUser(user);
          localStorage.setItem("af_dev_token", token);
          localStorage.setItem("af_dev_user", JSON.stringify(user));
          setDevAuthMsg({ type: "success", text: "Google Authentication successful!" });
          fetchUserProjects(token);
          fetchAuditLogs(token);
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  // Check health of backend server
  const checkServerHealth = async () => {
    setServerStatus("checking");
    const startTime = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      const endTime = performance.now();
      if (res.ok) {
        setServerStatus("online");
        setServerLatency(Math.round(endTime - startTime));
      } else {
        setServerStatus("offline");
        setServerLatency(null);
      }
    } catch {
      setServerStatus("offline");
      setServerLatency(null);
    }
  };

  useEffect(() => {
    checkServerHealth();
  }, []);

  // Fetch developer projects from backend
  const fetchUserProjects = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        if (data.data.length > 0) {
          setProjects(data.data);
          const savedProjectId = localStorage.getItem("af_selected_project_id");
          const matched = data.data.find((p: Project) => p.projectId === savedProjectId);
          const activeProj = matched || data.data[0];
          setSelectedProject(activeProj);
          fetchProjectUsers(activeProj.projectId, token);
        } else {
          autoCreateDefaultProject(token);
        }
      }
    } catch (err) {
      console.error("Failed to fetch developer projects:", err);
    }
  };

  // Helper to auto-create first project if user has none
  const autoCreateDefaultProject = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: "Default App" })
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setProjects([data.data]);
        setSelectedProject(data.data);
        localStorage.setItem("af_selected_project_id", data.data.projectId);
        fetchProjectUsers(data.data.projectId, token);
      }
    } catch (err) {
      console.error("Auto-create default project error:", err);
    }
  };

  // Fetch security audit logs from backend
  const fetchAuditLogs = async (token?: string, projectId?: string) => {
    const activeToken = token || developerToken;
    if (!activeToken) return;
    setIsLoadingAuditLogs(true);
    try {
      const targetProjectId = projectId !== undefined ? projectId : (selectedProject?.projectId || "");
      const queryParam = targetProjectId && targetProjectId !== "all" ? `?projectId=${encodeURIComponent(targetProjectId)}` : "";
      const res = await fetch(`${API_BASE_URL}/api/auth/auditLog${queryParam}`, {
        headers: { "Authorization": `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setAuditLogs(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  // Fetch end-users belonging to a specific project
  const fetchProjectUsers = async (projectId?: string, token?: string) => {
    const targetProjectId = projectId || selectedProject?.projectId;
    const activeToken = token || developerToken;
    if (!targetProjectId || !activeToken) return;

    setIsLoadingProjectUsers(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${targetProjectId}/users`, {
        headers: { "Authorization": `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setProjectUsers(data.data.users || []);
        setTotalProjectUsers(data.data.totalUsers || 0);
      }
    } catch (err) {
      console.error("Failed to fetch project users:", err);
    } finally {
      setIsLoadingProjectUsers(false);
    }
  };

  // Auto-fetch users whenever selected project or token changes
  useEffect(() => {
    if (selectedProject?.projectId && developerToken) {
      fetchProjectUsers(selectedProject.projectId, developerToken);
    }
  }, [selectedProject?.projectId, selectedProject?.apiKey, developerToken]);

  // Handle Developer Register / Login
  const handleDeveloperAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setDevAuthLoading(true);
    setDevAuthMsg(null);

    const generatedUsername = devEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
    const isRegister = authMode === "register";
    const primaryEndpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    
    const primaryPayload = isRegister 
      ? { name: devName || "Developer", username: generatedUsername, email: devEmail, password: devPassword }
      : { email: devEmail, password: devPassword };

    try {
      const res = await fetch(`${API_BASE_URL}${primaryEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(primaryPayload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        let token = data.data?.accessToken || data.token || data.accessToken;
        let user = data.data?.user || data.user || data.data;

        if (isRegister && !token) {
          const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: devEmail, password: devPassword })
          });
          const loginData = await loginRes.json();
          if (loginRes.ok && loginData.success) {
            token = loginData.data?.accessToken || loginData.token;
            user = loginData.data?.user || loginData.user || user;
          }
        }

        if (token) {
          setDeveloperToken(token);
          setDeveloperUser(user);
          localStorage.setItem("af_dev_token", token);
          localStorage.setItem("af_dev_user", JSON.stringify(user));
          setDevAuthMsg({ 
            type: "success", 
            text: isRegister ? "Account created & logged in successfully!" : "Logged in successfully!" 
          });
          
          fetchUserProjects(token);
          fetchAuditLogs(token);
        } else {
          setDevAuthMsg({ type: "error", text: data.message || "Registered, please login with your credentials." });
        }
      } else {
        setDevAuthMsg({ type: "error", text: data.message || "Authentication failed" });
      }
    } catch (err: any) {
      setDevAuthMsg({ type: "error", text: `Connection error to backend (${API_BASE_URL}). Check if server is running.` });
    } finally {
      setDevAuthLoading(false);
    }
  };

  // Handle Google OAuth Popup Trigger
  const handleGoogleLogin = () => {
    const oauthEndpoint = authMode === "register" ? "/api/auth/google" : "/api/auth/google/login";
    const targetUrl = `${API_BASE_URL}${oauthEndpoint}`;

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      targetUrl,
      "AuthForgeGoogleOAuth",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
  };

  // Handle Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!developerToken || !newProjectName.trim()) return;

    setIsCreatingProject(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${developerToken}`
        },
        body: JSON.stringify({ name: newProjectName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects((prev) => [data.data, ...prev]);
        setSelectedProject(data.data);
        setNewProjectName("");
      } else {
        alert(data.message || "Failed to create project");
      }
    } catch (err) {
      alert("Error creating project. Check backend connection.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  // Handle Rotate API Secret
  const handleRotateSecret = async (projectId: string) => {
    if (!developerToken) return;
    if (!confirm("Are you sure you want to rotate your API Secret? Old secret will be invalidated.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/keys/rotate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${developerToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects((prev) => prev.map((p) => p.projectId === projectId ? data.data : p));
        if (selectedProject?.projectId === projectId) {
          setSelectedProject(data.data);
        }
      } else {
        alert(data.message || "Failed to rotate key");
      }
    } catch (err) {
      alert("Failed to rotate key");
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (projectId: string) => {
    if (!developerToken) return;
    if (!confirm("Are you sure you want to delete this project? All associated API keys will be invalidated immediately.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${developerToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const remaining = projects.filter((p) => p.projectId !== projectId);
        setProjects(remaining);
        setSelectedProject(remaining.length > 0 ? remaining[0] : null);
        fetchAuditLogs();
      } else {
        alert(data.message || "Failed to delete project");
      }
    } catch (err) {
      alert("Error deleting project");
    }
  };

  // Logout Developer
  const handleLogout = () => {
    setDeveloperToken(null);
    setDeveloperUser(null);
    setProjects([]);
    setSelectedProject(null);
    localStorage.removeItem("af_dev_token");
    localStorage.removeItem("af_dev_user");
  };

  // Handle Logout All Devices
  const handleLogoutAll = async () => {
    if (!developerToken) return;
    if (!confirm("Are you sure you want to sign out from ALL active devices?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout-all`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${developerToken}` }
      });
    } catch {
      // ignore
    } finally {
      handleLogout();
    }
  };

  // Handle SDK Verify Token Sandbox
  const handleSdkVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdkTokenToVerify.trim()) return;
    setIsVerifyingSdkToken(true);
    setSdkVerificationResult("Authenticating token against SDK middleware endpoint...");
    try {
      const apiKey = selectedProject?.apiKey || "af_pk_9f82a17d84e921";
      const apiSecret = selectedProject?.apiSecret || "af_sk_3b71e40c92fa118e7";
      const projectId = selectedProject?.projectId || "proj_default";

      const res = await fetch(`${API_BASE_URL}/api/sdk/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "x-api-secret": apiSecret,
          "x-project-id": projectId
        },
        body: JSON.stringify({ token: sdkTokenToVerify })
      });
      const data = await res.json();
      setSdkVerificationResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setSdkVerificationResult(JSON.stringify({ error: err.message, hint: "Failed to connect to SDK verification endpoint." }, null, 2));
    } finally {
      setIsVerifyingSdkToken(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingApi(true);

    if (apiTestMode === "googleOAuth") {
      setApiResponse("Opening Google OAuth popup window...");
      handleGoogleLogin();
      setIsTestingApi(false);
      return;
    }

    let endpoint = "/api/sdk/auth/login";
    let method = "POST";
    let payload: any = {};

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (selectedProject) {
      if (selectedProject.projectId) headers["x-authforge-project-id"] = selectedProject.projectId;
      if (selectedProject.apiKey) headers["x-authforge-api-key"] = selectedProject.apiKey;
      if (selectedProject.apiSecret) headers["x-authforge-api-secret"] = selectedProject.apiSecret;
    }

    if (apiTestMode === "sdkRegister") {
      endpoint = "/api/sdk/auth/register";
      payload = { name: testName, username: testUsername, email: testEmail, password: testPassword };
    } else if (apiTestMode === "sdkLogin") {
      endpoint = "/api/sdk/auth/login";
      payload = { email: testEmail, password: testPassword };
    } else if (apiTestMode === "verifyToken") {
      endpoint = "/api/sdk/verify-token";
      payload = { token: sdkTokenToVerify || testResetToken };
    } else if (apiTestMode === "sdkInfo") {
      endpoint = "/api/sdk/info";
      method = "GET";
    } else if (apiTestMode === "login") {
      endpoint = "/api/auth/login";
      payload = { email: testEmail, password: testPassword };
    } else if (apiTestMode === "register") {
      endpoint = "/api/auth/register";
      payload = { name: testName, username: testUsername, email: testEmail, password: testPassword };
    } else if (apiTestMode === "forgotPassword") {
      endpoint = "/api/auth/forgot-password";
      payload = { email: testEmail };
    } else if (apiTestMode === "resetPassword") {
      endpoint = "/api/auth/reset-password";
      payload = { token: testResetToken, newPassword: testNewPassword };
    }

    setApiResponse(`Sending ${method} request to ${API_BASE_URL}${endpoint}...`);

    try {
      const options: RequestInit = {
        method,
        headers,
      };
      if (method !== "GET") {
        options.body = JSON.stringify(payload);
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));

      if (apiTestMode === "forgotPassword" && data.resetToken) {
        setTestResetToken(data.resetToken);
      }
      if ((apiTestMode === "sdkLogin" || apiTestMode === "sdkRegister") && data.data?.accessToken) {
        setSdkTokenToVerify(data.data.accessToken);
      }
      if (res.ok && data.success && (apiTestMode === "sdkRegister" || apiTestMode === "register")) {
        fetchProjectUsers();
      }
    } catch (err: any) {
      setApiResponse(
        JSON.stringify({ 
          error: "Failed to connect to backend server", 
          details: err.message,
          targetUrl: `${API_BASE_URL}${endpoint}`,
          hint: "Ensure Express backend server is running."
        }, null, 2)
      );
    } finally {
      setIsTestingApi(false);
    }
  };

  // Derived display credentials
  const currentConnString = selectedProject?.connectionString || 
    `authforge://af_pk_9f82a1:af_sk_3b71e4@proj_default?host=${encodeURIComponent(API_BASE_URL)}`;
  const currentApiKey = selectedProject?.apiKey || "af_pk_9f82a17d84e921";
  const currentApiSecret = selectedProject?.apiSecret || "af_sk_3b71e40c92fa118e7";
  const currentProjectId = selectedProject?.projectId || "proj_default";

  return {
    API_BASE_URL,
    copiedKey,
    serverStatus,
    serverLatency,
    activeTab,
    setActiveTab,
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
    projects,
    selectedProject,
    setSelectedProject,
    newProjectName,
    setNewProjectName,
    isCreatingProject,
    projectUsers,
    totalProjectUsers,
    isLoadingProjectUsers,
    fetchProjectUsers,
    auditLogs,
    isLoadingAuditLogs,
    activePortalTab,
    setActivePortalTab,
    sdkTokenToVerify,
    setSdkTokenToVerify,
    sdkVerificationResult,
    isVerifyingSdkToken,
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
    checkServerHealth,
    fetchAuditLogs,
    handleDeveloperAuth,
    handleGoogleLogin,
    handleCreateProject,
    handleRotateSecret,
    handleDeleteProject,
    handleLogout,
    handleLogoutAll,
    handleSdkVerifyToken,
    copyToClipboard,
    handleTestApi,
    currentConnString,
    currentApiKey,
    currentApiSecret,
    currentProjectId
  };
}
