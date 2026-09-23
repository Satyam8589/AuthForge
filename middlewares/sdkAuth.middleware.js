import Project from "../models/Project.model.js";

export const sdkAuthMiddleware = async (req, res, next) => {
    try {
        let apiKey = req.headers["x-authforge-api-key"];
        let projectId = req.headers["x-authforge-project-id"];
        let apiSecret = req.headers["x-authforge-api-secret"];

        // Support HTTP Basic Auth (username = apiKey, password = apiSecret)
        const authHeader = req.headers.authorization;
        if (!apiKey && authHeader && authHeader.startsWith("Basic ")) {
            const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString("utf-8");
            const [key, secret] = credentials.split(":");
            apiKey = key;
            apiSecret = secret;
        }

        // Support Bearer token if passed as Secret Key
        if (!apiKey && authHeader && authHeader.startsWith("Bearer af_sk_")) {
            apiSecret = authHeader.split(" ")[1];
        }

        if (!apiKey && !apiSecret) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed: Missing AuthForge API Key or Secret Key"
            });
        }

        const query = {};
        if (projectId) query.projectId = projectId;
        if (apiKey) query.apiKey = apiKey;
        if (apiSecret) query.apiSecret = apiSecret;

        const project = await Project.findOne(query);

        if (!project || !project.isActive) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed: Invalid or inactive AuthForge Project API credentials"
            });
        }

        // Check CORS / Allowed Origins if specified
        const origin = req.headers.origin;
        if (project.allowedOrigins && project.allowedOrigins.length > 0 && origin) {
            const isWildcard = project.allowedOrigins.includes("*");
            const isAllowed = isWildcard || project.allowedOrigins.some(o => 
                o === origin || 
                (origin.includes("localhost") && o.includes("localhost")) ||
                (origin.includes("127.0.0.1") && o.includes("127.0.0.1"))
            );
            if (!isAllowed) {
                return res.status(403).json({
                    success: false,
                    message: `CORS policy violation: Origin '${origin}' is not allowed for this AuthForge project`
                });
            }
        }

        req.project = project;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `SDK Authentication Error: ${error.message}`
        });
    }
};
