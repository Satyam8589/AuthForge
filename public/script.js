// Configuration
const API_BASE_URL = 'http://localhost:5000/api/auth';

// State
let accessToken = localStorage.getItem('accessToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// DOM Elements
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const responseElement = document.getElementById('response');
const userCard = document.getElementById('userCard');
const userInfo = document.getElementById('userInfo');
const userStatus = document.getElementById('userStatus');
const protectedActions = document.getElementById('protectedActions');
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
}

// Check if user is authenticated
async function checkAuthStatus() {
    if (accessToken) {
        try {
            const response = await fetch(`http://localhost:5000/api/user/current-user`, {
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
                // Token expired or invalid
                console.error('Session expired');
                accessToken = null;
                currentUser = null;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('currentUser');
                updateUIUnauthenticated();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // On network error, keep current UI but maybe warn the user
            updateUIAuthenticated(); 
        }
    } else {
        updateUIUnauthenticated();
    }
}

// Handle Register
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
            
            // Persist state
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
    
    // Choose the endpoint based on mode: /api/auth/google (unified) or /api/auth/google/login (strict)
    const endpoint = mode === 'login' ? '/api/auth/google/login' : '/api/auth/google';
    
    const popup = window.open(
        endpoint,
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );
    
    if (!popup) {
        showToast('Please allow popups for this site', 'error');
        return;
    }
    
    // Check if popup was closed
    const checkPopup = setInterval(() => {
        if (popup.closed) {
            clearInterval(checkPopup);
        }
    }, 1000);
}

// Handle OAuth Callback
function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for OAuth success
    if (urlParams.get('oauth') === 'success') {
        const accessTokenParam = urlParams.get('accessToken');
        const userParam = urlParams.get('user');
        const isNewUser = urlParams.get('isNewUser') === 'true';
        
        if (accessTokenParam && userParam) {
            try {
                accessToken = decodeURIComponent(accessTokenParam);
                currentUser = JSON.parse(decodeURIComponent(userParam));
                
                // Persist state
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
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/');
    }
    
    // Check for OAuth error
    if (urlParams.get('error')) {
        const errorMessage = decodeURIComponent(urlParams.get('error'));
        showToast(`OAuth Error: ${errorMessage}`, 'error');
        displayResponse({ error: errorMessage }, false);
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/');
    }
}

// Handle OAuth Message from Popup
function handleOAuthMessage(data) {
    const { accessToken: token, user, isNewUser } = data;
    
    accessToken = token;
    currentUser = user;
    
    // Persist state
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
            showToast(`Logged out from ${result.data.devicesLoggedOut} device(s)!`, 'success');
        } else {
            showToast(result.message || 'Logout all devices failed', 'error');
        }
    } catch (error) {
        displayResponse({ error: error.message }, false);
        showToast('Network error. Please try again.', 'error');
    }
}

// UI Updates
function updateUIAuthenticated() {
    userCard.style.display = 'block';
    protectedActions.style.display = 'block';
    authSection.style.display = 'none';
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
                <span class="user-info-value">${currentUser.name || 'N/A'}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Username:</span>
                <span class="user-info-value">${currentUser.username || 'N/A'}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Email:</span>
                <span class="user-info-value">${currentUser.email}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Role:</span>
                <span class="user-info-value">${currentUser.role}</span>
            </div>
            ${currentUser.googleId ? `
            <div class="user-info-item">
                <span class="user-info-label">Google ID:</span>
                <span class="user-info-value">${currentUser.googleId}</span>
            </div>
            ` : ''}
            <div class="user-info-item">
                <span class="user-info-label">Email Verified:</span>
                <span class="user-info-value">${currentUser.isEmailVerified ? '✅ Yes' : '❌ No'}</span>
            </div>
        `;
    }
}

function updateUIUnauthenticated() {
    userCard.style.display = 'none';
    protectedActions.style.display = 'none';
    authSection.style.display = 'grid';
    userStatus.classList.remove('authenticated');
    userStatus.querySelector('span:last-child').textContent = 'Not Authenticated';
}

// Display Response
function displayResponse(data, isSuccess) {
    responseElement.textContent = JSON.stringify(data, null, 2);
    responseElement.className = `response-content ${isSuccess ? 'success' : 'error'}`;
}

// Clear Response
function clearResponse() {
    responseElement.textContent = 'No response yet. Try an action above!';
    responseElement.className = 'response-content';
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
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}
