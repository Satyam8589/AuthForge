// Dynamic API base URLs based on window origin
const getApiOrigin = () => window.location.origin;
const API_BASE_URL = `${getApiOrigin()}/api/auth`;
const PROJECTS_API_URL = `${getApiOrigin()}/api/projects`;
const SDK_API_URL = `${getApiOrigin()}/api/sdk`;

// State
let accessToken = localStorage.getItem('accessToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let currentTab = 'auth';

// DOM Elements
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const responseElement = document.getElementById('response');
const userCard = document.getElementById('userCard');
const userInfo = document.getElementById('userInfo');
const userStatus = document.getElementById('userStatus');
const protectedActions = document.getElementById('protectedActions');
const projectsCard = document.getElementById('projectsCard');
const projectsList = document.getElementById('projectsList');
const createProjectForm = document.getElementById('createProjectForm');
const refreshProjectsBtn = document.getElementById('refreshProjectsBtn');
const sandboxCard = document.getElementById('sandboxCard');
const sdkTestForm = document.getElementById('sdkTestForm');
const auditCard = document.getElementById('auditCard');
const auditList = document.getElementById('auditList');
const fetchAuditBtn = document.getElementById('fetchAuditBtn');
const closeAuditBtn = document.getElementById('closeAuditBtn');
const toast = document.getElementById('toast');
const googleRegisterBtn = document.getElementById('googleRegisterBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const authSection = document.getElementById('authSection');
const logoutBtn = document.getElementById('logoutBtn');
const refreshTokenBtn = document.getElementById('refreshTokenBtn');
const logoutAllBtn = document.getElementById('logoutAllBtn');
const clearResponseBtn = document.getElementById('clearResponseBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    handleOAuthCallback();
    setupTabs();
    
    // Pre-fill SDK Sandbox with sample connection string for instant testing
    setupSdkSandboxDefaults();

    // Listen for messages from OAuth popup
    window.addEventListener('message', (event) => {
        if (event.data.type === 'oauth-success') {
            handleOAuthMessage(event.data);
        } else if (event.data.type === 'oauth-error') {
            showToast(`OAuth Error: ${event.data.message}`, 'error');
            displayResponse({ error: event.data.message }, false);
        }
    });
});

// Setup Navigation Tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            switchTab(currentTab);
        });
    });
}

function switchTab(tab) {
    if (tab === 'auth') {
        authSection.style.display = accessToken ? 'none' : 'grid';
        if (accessToken && userCard) userCard.style.display = 'block';
        if (accessToken && protectedActions) protectedActions.style.display = 'block';
        if (projectsCard) projectsCard.style.display = 'none';
        if (sandboxCard) sandboxCard.style.display = 'none';
        if (auditCard) auditCard.style.display = 'none';
    } else if (tab === 'projects') {
        authSection.style.display = 'none';
        if (projectsCard) projectsCard.style.display = 'block';
        if (sandboxCard) sandboxCard.style.display = 'none';
        if (auditCard) auditCard.style.display = 'none';
        if (accessToken) {
            loadUserProjects();
        } else {
            renderUnauthenticatedProjectsNotice();
        }
    } else if (tab === 'sandbox') {
        authSection.style.display = 'none';
        if (projectsCard) projectsCard.style.display = 'none';
        if (sandboxCard) sandboxCard.style.display = 'block';
        if (auditCard) auditCard.style.display = 'none';
    } else if (tab === 'audit') {
        authSection.style.display = 'none';
        if (projectsCard) projectsCard.style.display = 'none';
        if (sandboxCard) sandboxCard.style.display = 'none';
        if (auditCard) auditCard.style.display = 'block';
        if (accessToken) {
            fetchAuditLogs();
        } else {
            renderUnauthenticatedAuditNotice();
        }
    }
}

function setupSdkSandboxDefaults() {
    const connInput = document.getElementById('sdkConnStrInput');
    const tokenInput = document.getElementById('sdkTokenInput');
    if (connInput && !connInput.value) {
        connInput.value = `authforge://af_pk_live_demo123:af_sk_live_demo456@proj_demo?host=${encodeURIComponent(getApiOrigin())}`;
    }
    if (tokenInput && accessToken) {
        tokenInput.value = accessToken;
    }
}

// Event Listeners
function setupEventListeners() {
    registerForm.addEventListener('submit', handleRegister);
    loginForm.addEventListener('submit', handleLogin);
    
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', () => signInWithGoogle('register'));
    }
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => signInWithGoogle('login'));
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    if (refreshTokenBtn) {
        refreshTokenBtn.addEventListener('click', refreshToken);
    }

    if (logoutAllBtn) {
        logoutAllBtn.addEventListener('click', logoutAllDevices);
    }

    if (clearResponseBtn) {
        clearResponseBtn.addEventListener('click', clearResponse);
    }

    if (createProjectForm) {
        createProjectForm.addEventListener('submit', handleCreateProject);
    }

    if (refreshProjectsBtn) {
        refreshProjectsBtn.addEventListener('click', loadUserProjects);
    }

    if (fetchAuditBtn) {
        fetchAuditBtn.addEventListener('click', () => {
            switchTab('audit');
            const auditTabBtn = document.querySelector('[data-tab="audit"]');
            if (auditTabBtn) {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                auditTabBtn.classList.add('active');
            }
        });
    }

    if (closeAuditBtn) {
        closeAuditBtn.addEventListener('click', () => {
            if (auditCard) auditCard.style.display = 'none';
        });
    }

    if (sdkTestForm) {
        sdkTestForm.addEventListener('submit', handleSdkTest);
    }
}

// Check if user is authenticated
async function checkAuthStatus() {
    if (accessToken) {
        try {
            const response = await fetch(`${getApiOrigin()}/api/user/current-user`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                currentUser = result.data;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateUIAuthenticated();
            } else {
                console.error('Session expired');
                accessToken = null;
                currentUser = null;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('currentUser');
                updateUIUnauthenticated();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            updateUIAuthenticated(); 
        }
    } else {
        updateUIUnauthenticated();
    }
}

// Handle Registration
async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData);

    setLoading(e.target, true);

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        displayResponse(result, response.ok);

        if (response.ok) {
            showToast('Registration successful! Please login.', 'success');
            registerForm.reset();
        } else {
            showToast(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        displayResponse({ error: error.message }, false);
        showToast('Network error. Please try again.', 'error');
    } finally {
        setLoading(e.target, false);
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData);

    setLoading(e.target, true);

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const result = await response.json();
        displayResponse(result, response.ok);

        if (response.ok) {
            accessToken = result.data.accessToken;
            currentUser = result.data.user;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUIAuthenticated();
            showToast('Login successful!', 'success');
            loginForm.reset();
        } else {
            showToast(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        displayResponse({ error: error.message }, false);
        showToast('Network error. Please try again.', 'error');
    } finally {
        setLoading(e.target, false);
    }
}

// Handle Google OAuth Sign In
function signInWithGoogle(mode = 'register') {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const endpoint = mode === 'login' ? `${API_BASE_URL}/google/login` : `${API_BASE_URL}/google`;
    
    const popup = window.open(
        endpoint,
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );
    
    if (!popup) {
        showToast('Please allow popups for this site', 'error');
        return;
    }

    const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
            clearInterval(checkPopup);
        }
    }, 1000);
}

// Handle OAuth Callback
function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('oauth') === 'success') {
        const accessTokenParam = urlParams.get('accessToken');
        const userParam = urlParams.get('user');
        const isNewUser = urlParams.get('isNewUser') === 'true';
        
        if (accessTokenParam && userParam) {
            try {
                accessToken = decodeURIComponent(accessTokenParam);
                currentUser = JSON.parse(decodeURIComponent(userParam));
                
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                updateUIAuthenticated();
                
                const message = isNewUser ? 
                    '🎉 Registration successful! Welcome!' : 
                    '✅ Login successful! Welcome back!';
                showToast(message, 'success');
                
                displayResponse({
                    success: true,
                    message: message,
                    data: {
                        accessToken: accessToken,
                        user: currentUser,
                        isNewUser: isNewUser
                    }
                }, true);
                
            } catch (error) {
                console.error('Error parsing OAuth data:', error);
                showToast('Error processing OAuth data', 'error');
            }
        }
        
        window.history.replaceState({}, document.title, '/');
    }
    
    if (urlParams.get('error')) {
        const errorMessage = decodeURIComponent(urlParams.get('error'));
        showToast(`OAuth Error: ${errorMessage}`, 'error');
        displayResponse({ error: errorMessage }, false);
        window.history.replaceState({}, document.title, '/');
    }
}

// Handle OAuth Message from Popup
function handleOAuthMessage(data) {
    const { accessToken: token, user, isNewUser } = data;
    
    accessToken = token;
    currentUser = user;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    updateUIAuthenticated();
    
    const message = isNewUser ? 
        '🎉 Registration successful! Welcome!' : 
        '✅ Login successful! Welcome back!';
    showToast(message, 'success');
    
    displayResponse({
        success: true,
        message: message,
        data: {
            accessToken: accessToken,
            user: currentUser,
            isNewUser: isNewUser
        }
    }, true);
}

// Refresh Token
async function refreshToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/refresh-token`, {
            method: 'POST',
            credentials: 'include',
        });

        const result = await response.json();
        displayResponse(result, response.ok);

        if (response.ok) {
            accessToken = result.data.accessToken;
            localStorage.setItem('accessToken', accessToken);
            showToast('Token refreshed successfully!', 'success');
        } else {
            showToast(result.message || 'Token refresh failed', 'error');
        }
    } catch (error) {
        displayResponse({ error: error.message }, false);
        showToast('Network error. Please try again.', 'error');
    }
}

// Logout
async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });

        const result = await response.json();
        displayResponse(result, response.ok);

        if (response.ok) {
            accessToken = null;
            currentUser = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('currentUser');
            updateUIUnauthenticated();
            showToast('Logged out successfully!', 'success');
        } else {
            showToast(result.message || 'Logout failed', 'error');
        }
    } catch (error) {
        displayResponse({ error: error.message }, false);
        showToast('Network error. Please try again.', 'error');
    }
}

// Logout All Devices
async function logoutAllDevices() {
    try {
        const response = await fetch(`${API_BASE_URL}/logout-all`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });

        const result = await response.json();
        displayResponse(result, response.ok);

        if (response.ok) {
            accessToken = null;
            currentUser = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('currentUser');
            updateUIUnauthenticated();
            showToast(`Logged out from ${result.data?.devicesLoggedOut || 1} device(s)!`, 'success');
        } else {
            showToast(result.message || 'Logout all devices failed', 'error');
        }
    } catch (error) {
        displayResponse({ error: error.message }, false);
        showToast('Network error. Please try again.', 'error');
    }
}

// Fetch Audit Logs
async function fetchAuditLogs() {
    if (!accessToken) return;
    try {
        const response = await fetch(`${API_BASE_URL}/auditLog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ limit: 10 })
        });

        const result = await response.json();
        displayResponse(result, response.ok);

        if (response.ok && result.data) {
            renderAuditLogs(result.data);
            if (auditCard) auditCard.style.display = 'block';
            showToast('Audit logs loaded!', 'success');
        } else {
            showToast(result.message || 'Failed to load audit logs', 'error');
        }
    } catch (error) {
        showToast('Network error fetching audit logs', 'error');
    }
}

function renderAuditLogs(logs) {
    if (!auditList) return;
    if (!logs || logs.length === 0) {
        auditList.innerHTML = `<p class="empty-state">No security audit logs found.</p>`;
        return;
    }

    auditList.innerHTML = logs.map(log => `
        <div class="audit-item">
            <div>
                <span class="audit-action">${escapeHtml(log.action)}</span>
                <span style="margin-left: 0.5rem; color: var(--text-primary); font-weight: 500;">
                    ${escapeHtml(log.status || 'SUCCESS')}
                </span>
            </div>
            <div class="audit-meta">
                <span>IP: ${escapeHtml(log.ipAddress || 'Localhost')}</span> • 
                <span>${new Date(log.createdAt || Date.now()).toLocaleString()}</span>
            </div>
        </div>
    `).join('');
}

function renderUnauthenticatedAuditNotice() {
    if (!auditList) return;
    auditList.innerHTML = `
        <div style="text-align: center; padding: 1.5rem;">
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">🔒 Please Sign In or Register to view your account security audit logs.</p>
            <button onclick="switchToAuthTab()" class="btn btn-primary" style="margin: 0 auto; display: inline-block;">Go to Sign In</button>
        </div>
    `;
}

// Developer Projects & Connection Strings Functions
async function loadUserProjects() {
    if (!accessToken) return;
    try {
        const response = await fetch(PROJECTS_API_URL, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const result = await response.json();
        if (response.ok && result.data) {
            renderProjects(result.data);
        }
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

async function handleCreateProject(e) {
    e.preventDefault();
    if (!accessToken) {
        showToast('Please Sign In first to create AuthForge projects!', 'error');
        switchToAuthTab();
        return;
    }

    const name = document.getElementById('projectNameInput').value.trim();
    const originsRaw = document.getElementById('projectOriginInput').value.trim();
    const allowedOrigins = originsRaw ? originsRaw.split(',').map(s => s.trim()) : [];

    try {
        const response = await fetch(PROJECTS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ name, allowedOrigins })
        });

        const result = await response.json();
        displayResponse(result, response.ok);

        if (response.ok) {
            showToast('AuthForge Project created successfully!', 'success');
            createProjectForm.reset();
            loadUserProjects();
        } else {
            showToast(result.message || 'Project creation failed', 'error');
        }
    } catch (error) {
        showToast('Error creating project', 'error');
    }
}

function renderProjects(projects) {
    if (!projectsList) return;

    if (projects.length === 0) {
        projectsList.innerHTML = `<p class="empty-state">No active projects found. Create your first project above to generate a Connection String!</p>`;
        return;
    }

    projectsList.innerHTML = projects.map(p => `
        <div class="project-item">
            <div class="project-header">
                <span class="project-title">
                    ⚡ ${escapeHtml(p.name)}
                    <span class="badge">Active</span>
                </span>
                <div>
                    <button onclick="regenerateSecret('${p.projectId}')" class="btn-icon" title="Regenerate API Secret">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                    </button>
                    <button onclick="deleteProject('${p.projectId}')" class="btn-icon" title="Delete project">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <label style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">Connection String (Use in external apps):</label>
            <div class="conn-box">
                <span class="conn-text">${escapeHtml(p.connectionString)}</span>
                <button class="btn-copy" onclick="copyText('${escapeHtml(p.connectionString)}')">Copy String</button>
            </div>

            <div class="keys-info">
                <span><strong>Project ID:</strong> <code>${escapeHtml(p.projectId)}</code></span>
                <span><strong>API Key:</strong> <code>${escapeHtml(p.apiKey)}</code></span>
            </div>
        </div>
    `).join('');
}

function renderUnauthenticatedProjectsNotice() {
    if (!projectsList) return;
    const demoConn = `authforge://af_pk_live_demo123:af_sk_live_demo456@proj_demo?host=${encodeURIComponent(getApiOrigin())}`;
    projectsList.innerHTML = `
        <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(102, 126, 234, 0.1); border-radius: 8px; border: 1px dashed var(--primary);">
            <p style="font-size: 0.85rem; color: var(--text-primary); margin-bottom: 0.5rem;">💡 <strong>Sample Connection String Preview</strong> (Sign in to create your live project strings):</p>
            <div class="conn-box">
                <span class="conn-text">${escapeHtml(demoConn)}</span>
                <button class="btn-copy" onclick="copyText('${escapeHtml(demoConn)}')">Copy Demo</button>
            </div>
        </div>
        <p class="empty-state">🔒 Sign In or Register to create live project API keys & connection strings!</p>
    `;
}

window.switchToAuthTab = function() {
    const authTabBtn = document.querySelector('[data-tab="auth"]');
    if (authTabBtn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        authTabBtn.classList.add('active');
        switchTab('auth');
    }
};

window.regenerateSecret = async function(projectId) {
    if (!confirm('Regenerating your API secret will invalidate previous connection strings for this project. Continue?')) return;
    try {
        const response = await fetch(`${PROJECTS_API_URL}/${projectId}/regenerate-secret`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const result = await response.json();
        displayResponse(result, response.ok);
        if (response.ok) {
            showToast('API Secret regenerated!', 'success');
            loadUserProjects();
        } else {
            showToast(result.message || 'Regeneration failed', 'error');
        }
    } catch (err) {
        showToast('Error regenerating secret', 'error');
    }
};

window.deleteProject = async function(projectId) {
    if (!confirm('Are you sure you want to delete this AuthForge project?')) return;
    try {
        const response = await fetch(`${PROJECTS_API_URL}/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const result = await response.json();
        displayResponse(result, response.ok);
        if (response.ok) {
            showToast('Project deleted', 'success');
            loadUserProjects();
        } else {
            showToast(result.message || 'Delete failed', 'error');
        }
    } catch (err) {
        showToast('Delete error', 'error');
    }
};

// SDK Verification Tester Sandbox
async function handleSdkTest(e) {
    e.preventDefault();
    const connStr = document.getElementById('sdkConnStrInput').value.trim();
    const token = document.getElementById('sdkTokenInput').value.trim();

    if (!connStr || !token) {
        showToast('Connection string and Token are required', 'error');
        return;
    }

    try {
        // Parse connection string
        const rawStr = connStr.replace("authforge://", "http://");
        const parsed = new URL(rawStr);
        const apiKey = decodeURIComponent(parsed.username);
        const apiSecret = decodeURIComponent(parsed.password);
        const projectId = parsed.searchParams.get("projectId") || parsed.hostname;
        let host = parsed.searchParams.get("host") ? decodeURIComponent(parsed.searchParams.get("host")) : getApiOrigin();

        const response = await fetch(`${host}/api/sdk/verify-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-AuthForge-API-Key': apiKey,
                'X-AuthForge-API-Secret': apiSecret,
                'X-AuthForge-Project-ID': projectId
            },
            body: JSON.stringify({ token })
        });

        const result = await response.json();
        displayResponse(result, response.ok);

        if (response.ok && result.valid) {
            showToast('✅ SDK Verification Passed! Token is valid.', 'success');
        } else {
            showToast(`❌ SDK Verification Response: ${result.message}`, 'error');
        }
    } catch (error) {
        displayResponse({ error: error.message }, false);
        showToast(`SDK Test Error: ${error.message}`, 'error');
    }
}

window.copyText = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Connection string copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy string', 'error');
    });
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// UI Updates
function updateUIAuthenticated() {
    if (currentTab === 'auth') {
        userCard.style.display = 'block';
        protectedActions.style.display = 'block';
        authSection.style.display = 'none';
    }
    userStatus.classList.add('authenticated');
    userStatus.querySelector('span:last-child').textContent = 'Authenticated';
    
    if (currentUser) {
        userInfo.innerHTML = `
            ${currentUser.picture ? `
            <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
                <img src="${currentUser.picture}" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid var(--primary); padding: 2px;">
            </div>
            ` : ''}
            <div class="user-info-item">
                <span class="user-info-label">Name:</span>
                <span class="user-info-value">${escapeHtml(currentUser.name || 'N/A')}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Username:</span>
                <span class="user-info-value">${escapeHtml(currentUser.username || 'N/A')}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Email:</span>
                <span class="user-info-value">${escapeHtml(currentUser.email)}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Role:</span>
                <span class="user-info-value">${escapeHtml(currentUser.role)}</span>
            </div>
            ${currentUser.googleId ? `
            <div class="user-info-item">
                <span class="user-info-label">Google ID:</span>
                <span class="user-info-value">${escapeHtml(currentUser.googleId)}</span>
            </div>
            ` : ''}
            <div class="user-info-item">
                <span class="user-info-label">Email Verified:</span>
                <span class="user-info-value">${currentUser.isEmailVerified ? '✅ Yes' : '❌ No'}</span>
            </div>
        `;

        setupSdkSandboxDefaults();
    }

    if (currentTab === 'projects') loadUserProjects();
}

function updateUIUnauthenticated() {
    userCard.style.display = 'none';
    protectedActions.style.display = 'none';
    if (currentTab === 'auth') {
        authSection.style.display = 'grid';
    }
    userStatus.classList.remove('authenticated');
    userStatus.querySelector('span:last-child').textContent = 'Not Authenticated';

    if (currentTab === 'projects') renderUnauthenticatedProjectsNotice();
    if (currentTab === 'audit') renderUnauthenticatedAuditNotice();
}

function displayResponse(data, isSuccess) {
    responseElement.textContent = JSON.stringify(data, null, 2);
    responseElement.className = `response-content ${isSuccess ? 'success' : 'error'}`;
    const statusTag = document.querySelector('.terminal-status-tag');
    if (statusTag) {
        statusTag.textContent = isSuccess ? '200 OK / Success' : 'Error / Failed';
        statusTag.style.color = isSuccess ? 'var(--success)' : 'var(--error)';
        statusTag.style.background = isSuccess ? 'var(--success-bg)' : 'var(--error-bg)';
    }
}

// Clear Response
function clearResponse() {
    responseElement.textContent = 'No response yet. Perform an action above to inspect live API payloads.';
    responseElement.className = 'response-content';
    const statusTag = document.querySelector('.terminal-status-tag');
    if (statusTag) {
        statusTag.textContent = 'Ready';
        statusTag.style.color = 'var(--success)';
        statusTag.style.background = 'var(--success-bg)';
    }
}

// Show Toast
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Set Loading State
function setLoading(form, isLoading) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}
