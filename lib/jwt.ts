import jwt from "jsonwebtoken";

// Verifica se está rodando no servidor
const isServer = typeof window === "undefined";

const JWT_SECRET = isServer ? process.env.JWT_SECRET : undefined;

if (isServer && !JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const secret: jwt.Secret = JWT_SECRET || "";

export interface JWTPayload {
  userId: string;
  address: string;
  chain: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}

export function signToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  if (!isServer || !JWT_SECRET) {
    throw new Error("signToken can only be called on the server side");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "24h",
    issuer: "web3-auth",
    audience: "web3-app",
  });
}

export function verifyToken(token: string): JWTPayload | null {
  if (!isServer || !JWT_SECRET) {
    throw new Error("verifyToken can only be called on the server side");
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: "web3-auth",
      audience: "web3-app",
    });

    if (typeof decoded === "string") {
      return null;
    }

    return {
      userId: decoded.userId as string,
      address: decoded.address as string,
      chain: decoded.chain as string,
      iat: decoded.iat,
      exp: decoded.exp,
      iss: decoded.iss,
      aud: decoded.aud,
    };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
