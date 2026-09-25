import axios from "axios";

export class AuthForgeClient {
    /**
     * Initialize AuthForge Client with a connection string or config object
     * @param {string | { apiKey: string, apiSecret: string, projectId: string, host?: string }} config 
     */
    constructor(config) {
        if (typeof config === "string") {
            this.config = AuthForgeClient.parseConnectionString(config);
        } else if (config && typeof config === "object") {
            this.config = {
                apiKey: config.apiKey,
                apiSecret: config.apiSecret,
                projectId: config.projectId,
                host: config.host || "http://localhost:2000"
            };
        } else {
            throw new Error("AuthForgeClient requires a connection string or configuration object.");
        }

        if (!this.config.host) {
            throw new Error("AuthForge host URL is required.");
        }

        // Clean trailing slash from host URL if present
        if (this.config.host.endsWith("/")) {
            this.config.host = this.config.host.slice(0, -1);
        }
    }

    /**
     * Parses connection string format: authforge://apiKey:apiSecret@projectId?host=http://localhost:2000
     */
    static parseConnectionString(connStr) {
        if (!connStr || !connStr.startsWith("authforge://")) {
            throw new Error("Invalid AuthForge connection string scheme. Expected format starting with 'authforge://'");
        }

        try {
            const rawStr = connStr.replace("authforge://", "http://");
            const parsed = new URL(rawStr);

            const apiKey = parsed.username;
            const apiSecret = parsed.password;

            let projectId = parsed.hostname;
            let host = parsed.searchParams.get("host");

            if (!host && parsed.port) {
                host = `http://${parsed.hostname}:${parsed.port}`;
                projectId = parsed.searchParams.get("projectId") || projectId;
            }

            if (!host) {
                host = "http://localhost:2000";
            } else {
                host = decodeURIComponent(host);
            }

            return {
                apiKey: decodeURIComponent(apiKey),
                apiSecret: decodeURIComponent(apiSecret),
                projectId,
                host
            };
        } catch (error) {
            throw new Error(`Failed to parse AuthForge connection string: ${error.message}`);
        }
    }

    getHeaders() {
        return {
            "Content-Type": "application/json",
            "X-AuthForge-API-Key": this.config.apiKey,
            "X-AuthForge-API-Secret": this.config.apiSecret,
            "X-AuthForge-Project-ID": this.config.projectId
        };
    }

    /**
     * Verifies a user JWT access token against the AuthForge server.
     * @param {string} token 
     * @returns {Promise<object>} { valid: boolean, data?: object, message?: string }
     */
    async verifyToken(token) {
        if (!token) throw new Error("Token is required for verification");

        try {
            const response = await axios.post(
                `${this.config.host}/api/sdk/verify-token`,
                { token },
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            const errData = error.response?.data || {};
            return {
                valid: false,
                message: errData.message || error.message
            };
        }
    }

    /**
     * Express Middleware for external applications to authenticate incoming requests.
     * Attaches req.user and req.authForge.
     */
    expressMiddleware() {
        return async (req, res, next) => {
            const authHeader = req.headers.authorization;
            let token = null;

            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            } else if (req.cookies && (req.cookies.token || req.cookies.accessToken)) {
                token = req.cookies.token || req.cookies.accessToken;
            }

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: "Authorization token missing or malformed"
                });
            }

            const result = await this.verifyToken(token);

            if (!result.valid) {
                return res.status(401).json({
                    success: false,
                    message: result.message || "Invalid authentication token"
                });
            }

            req.user = result.data.user;
            req.authForge = result.data;
            next();
        };
    }

    /**
     * Authenticates a user under this project.
     */
    async login(email, password) {
        const response = await axios.post(
            `${this.config.host}/api/sdk/auth/login`,
            { email, password },
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    /**
     * Registers a user under this project.
     */
    async register(userData) {
        const response = await axios.post(
            `${this.config.host}/api/sdk/auth/register`,
            userData,
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    /**
     * Authenticates or registers a user via Google Auth under this project.
     * @param {object} googleUserData - { email, googleId, name, picture }
     */
    async loginWithGoogle(googleUserData) {
        if (!googleUserData || typeof googleUserData !== "object") {
            throw new Error("Google user data object is required");
        }
        const response = await axios.post(
            `${this.config.host}/api/sdk/auth/google`,
            googleUserData,
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    /**
     * Triggers a password reset email for a user under this project.
     * @param {string} email 
     */
    async forgotPassword(email) {
        if (!email) throw new Error("Email is required for password reset");
        const response = await axios.post(
            `${this.config.host}/api/auth/forgot-password`,
            { email },
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    /**
     * Resets a user password using a valid reset token.
     * @param {string} token 
     * @param {string} newPassword 
     */
    async resetPassword(token, newPassword) {
        if (!token || !newPassword) throw new Error("Reset token and new password are required");
        const response = await axios.post(
            `${this.config.host}/api/auth/reset-password`,
            { token, newPassword },
            { headers: this.getHeaders() }
        );
        return response.data;
    }
}

export default AuthForgeClient;
