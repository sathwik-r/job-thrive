import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { storage } from "./db-storage";
import { env } from './config/env';
// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        role: string;
        cognitoSub: string;
      };
    }
  }
}

interface CognitoJWTPayload {
  sub: string; // Cognito user ID
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  aud: string; // audience (client ID)
  iss: string; // issuer
  token_use: string; // "id" for ID tokens
  auth_time: number;
  iat: number;
  exp: number;
}

const COGNITO_USER_POOL_ID = env.COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = env.COGNITO_CLIENT_ID;

// Derive region from the user pool id (before the underscore)
const COGNITO_REGION = COGNITO_USER_POOL_ID.includes('_')
  ? COGNITO_USER_POOL_ID.split('_')[0]
  : 'ap-south-1';

// Construct issuer and JWKS URI from env to ensure consistency
const COGNITO_ISSUER = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;
const COGNITO_JWKS_URI = `${COGNITO_ISSUER}/.well-known/jwks.json`;

// JWKS client to get public keys from Cognito
const client = jwksClient({
  jwksUri: COGNITO_JWKS_URI,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 24 * 60 * 60 * 1000, // 24 hours
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export class AuthService {
  static async verifyCognitoToken(token: string): Promise<CognitoJWTPayload | null> {
    return new Promise((resolve) => {
      jwt.verify(token, getKey, {
        audience: COGNITO_CLIENT_ID,
        issuer: COGNITO_ISSUER,
        algorithms: ['RS256'],
      }, (err, decoded) => {
        if (err) {
          resolve(null);
          return;
        }
        
        const payload = decoded as CognitoJWTPayload;
        
        // Verify it's an ID token
        if (payload.token_use !== 'id') {
          resolve(null);
          return;
        }
        
        resolve(payload);
      });
    });
  }

  static async getUserFromToken(token: string): Promise<any> {
    try {
      const decoded = await this.verifyCognitoToken(token);
      if (!decoded) return null;

    if ( decoded.email) {
        return await storage.getUserByEmail(decoded.email);
      }
      return null;
    } catch (error) {
      console.error("Failed to get user from token:", error);
      return null;
    }
  }
}

// Middleware to validate Cognito JWT tokens
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    // Basic token format validation
    if (token.split('.').length !== 3) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = await AuthService.verifyCognitoToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Get user from database
    const user = await AuthService.getUserFromToken(token);
    if (!user || !user.active) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cognitoSub: decoded.sub,
    };
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Optional middleware for routes that work with or without auth
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (token) {
      const decoded = await AuthService.verifyCognitoToken(token);
      if (decoded) {
        const user = await AuthService.getUserFromToken(token);
        if (user && user.active) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            cognitoSub: decoded.sub,
          };
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth, just continue without user
    next();
  }
};

// Middleware to check specific roles
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role) && !roles.includes("both")) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}; 