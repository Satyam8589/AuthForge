export const getOAuthCompletionHTML = ({ success, data, error }) => {
    if (success) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authenticating...</title>
                <style>
                    body { font-family: -apple-system, sans-serif; background: #0f172a; color: white; height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
                    .card { text-align: center; padding: 2rem; border-radius: 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
                    .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #6366f1; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="spinner"></div>
                    <h2 style="margin: 0 0 0.5rem 0;">Authorized!</h2>
                    <p style="margin: 0; color: #94a3b8; font-size: 0.875rem;">Finalizing your session...</p>
                </div>
                <script>
                    const payload = { type: 'oauth-success', ...${JSON.stringify(data)} };
                    if (window.opener) {
                        window.opener.postMessage(payload, "*");
                        setTimeout(() => window.close(), 1000);
                    } else {
                        window.location.href = "/";
                    }
                </script>
            </body>
            </html>
        `;
    }

    return `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; background: #0f172a; color: white; height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0;">
            <div style="text-align: center; padding: 2rem; background: rgba(239,68,68,0.1); border-radius: 1rem; border: 1px solid rgba(239,68,68,0.2);">
                <h2 style="color: #f87171; margin-top: 0;">Authentication Error</h2>
                <p>${error || 'An unexpected error occurred'}</p>
                <button onclick="window.close()" style="background: #ef4444; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">Close Window</button>
            </div>
        </body>
        </html>
    `;
};
