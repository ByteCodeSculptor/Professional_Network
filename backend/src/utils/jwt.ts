import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; 
const JWT_EXPIRY = parseInt(process.env.JWT_EXPIRY || '86400', 10); //Set to 24 hours
const REFRESH_TOKEN_EXPIRY = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '2592000', 10); //Set to 30 days

export interface JWTPayload {
  sub: string;
  email: string;
  userType: string;
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRY as number };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRY as number };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};