import { Request, Response, NextFunction } from 'express';

export interface AuthForgeConfig {
    apiKey: string;
    apiSecret: string;
    projectId: string;
    host?: string;
}

export interface VerifyTokenResult {
    valid: boolean;
    data?: {
        user: {
            id: string;
            email: string;
            name?: string;
            role?: string;
            [key: string]: any;
        };
        tokenPayload?: any;
    };
    message?: string;
}

export interface RegisterUserData {
    email: string;
    password: string;
    name?: string;
    [key: string]: any;
}

export interface GoogleUserData {
    email: string;
    googleId: string;
    name?: string;
    picture?: string;
}

export class AuthForgeClient {
    constructor(config: string | AuthForgeConfig);

    static parseConnectionString(connStr: string): AuthForgeConfig;

    getHeaders(): Record<string, string>;

    verifyToken(token: string): Promise<VerifyTokenResult>;

    expressMiddleware(): (req: Request & { user?: any; authForge?: any }, res: Response, next: NextFunction) => Promise<any>;

    login(email: string, password: string): Promise<any>;

    register(userData: RegisterUserData): Promise<any>;

    loginWithGoogle(googleUserData: GoogleUserData): Promise<any>;
}

export default AuthForgeClient;
