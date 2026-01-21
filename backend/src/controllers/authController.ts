import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  userType: z.enum(['professional', 'company']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  consents: z.object({
    terms: z.boolean(),
    privacy: z.boolean(),
    marketing: z.boolean().optional(),
  }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    if (!validatePasswordStrength(data.password)) {
      throw new AppError(
        400,
        'WEAK_PASSWORD',
        'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError(409, 'USER_EXISTS', 'User with this email already exists');
    }

    const passwordHash = await hashPassword(data.password);

    // ALL database operations inside one transaction
    const user = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          userType: data.userType,
        },
      });

      // 2. Create Profile based on userType
      if (data.userType === 'professional') {
        await tx.professionalProfile.create({
          data: {
            userId: newUser.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            skills: [],
          },
        });
      } else {
        await tx.companyProfile.create({
          data: {
            userId: newUser.id,
            companyName: data.companyName || '',
          },
        });
      }

      // 3. Create Consents
      const consentData = Object.entries(data.consents)
        .filter(([_, given]) => given !== undefined)
        .map(([type, given]) => ({
          userId: newUser.id,
          consentType: type,
          consentGiven: !!given,
          consentText: `User ${given ? 'accepted' : 'declined'} ${type}`,
          ipAddress: req.ip || '',
          userAgent: req.headers['user-agent'] || '',
        }));

      if (consentData.length > 0) {
        await tx.consentRecord.createMany({ data: consentData });
      }

      return newUser;
    });

    // Generate tokens
    const accessToken = generateAccessToken({ 
      sub: user.id, 
      email: user.email, 
      userType: user.userType 
    });
    const refreshToken = generateRefreshToken({ 
      sub: user.id, 
      email: user.email, 
      userType: user.userType 
    });

    logger.info('User registered successfully with profile', { 
      userId: user.id, 
      userType: user.userType 
    });

    res.status(201).json({
      user: { 
        id: user.id, 
        email: user.email, 
        userType: user.userType,
        emailVerified: user.emailVerified,
      },
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || user.status !== 'active') {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isValidPassword = await comparePassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      userType: user.userType,
    });

    const refreshToken = generateRefreshToken({
      sub: user.id,
      email: user.email,
      userType: user.userType,
    });

    logger.info('User logged in successfully', { userId: user.id });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        emailVerified: user.emailVerified,
      },
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await redis.setex(`blacklist:${token}`, 86400, 'true');
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.sub;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        professionalProfile: true,
        companyProfile: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    res.json({
      id: user.id,
      email: user.email,
      userType: user.userType,
      emailVerified: user.emailVerified,
      profile: user.professionalProfile || user.companyProfile,
    });
  } catch (error) {
    next(error);
  }
};
