import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

const updateProfessionalProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  hourlyRate: z.number().positive().optional(),
  availability: z.enum(['available', 'busy', 'not_available']).optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  portfolioUrl: z.string().url().optional(),
});

const updateCompanyProfileSchema = z.object({
  companyName: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  companySize: z.enum(['ONE_TO_TEN', 'ELEVEN_TO_FIFTY', 'FIFTY_ONE_TO_TWO_HUNDRED', 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED', 'FIVE_HUNDRED_PLUS']).optional(),
  websiteUrl: z.string().url().optional(),
  location: z.string().optional(),
});

export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.userType;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    if (userType === 'professional') {
      const profile = await prisma.professionalProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              email: true,
              emailVerified: true,
              createdAt: true,
            },
          },
        },
      });

      if (!profile) {
        throw new AppError(404, 'NOT_FOUND', 'Profile not found');
      }

      res.json({
        success: true,
        data: profile,
      });
    } else if (userType === 'company') {
      const profile = await prisma.companyProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              email: true,
              emailVerified: true,
              createdAt: true,
            },
          },
        },
      });

      if (!profile) {
        throw new AppError(404, 'NOT_FOUND', 'Profile not found');
      }

      res.json({
        success: true,
        data: profile,
      });
    } else {
      throw new AppError(400, 'INVALID_USER_TYPE', 'Invalid user type');
    }
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.userType;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    if (userType === 'professional') {
      const data = updateProfessionalProfileSchema.parse(req.body);

      const profile = await prisma.professionalProfile.update({
        where: { userId },
        data: {
          ...data,
          skills: data.skills ? JSON.stringify(data.skills) : undefined,
        },
        include: {
          user: {
            select: {
              email: true,
              emailVerified: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: profile,
      });
    } else if (userType === 'company') {
      const data = updateCompanyProfileSchema.parse(req.body);

      const profile = await prisma.companyProfile.update({
        where: { userId },
        data,
        include: {
          user: {
            select: {
              email: true,
              emailVerified: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: profile,
      });
    } else {
      throw new AppError(400, 'INVALID_USER_TYPE', 'Invalid user type');
    }
  } catch (error) {
    next(error);
  }
};

export const getProfileById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (type === 'professional') {
      const profile = await prisma.professionalProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!profile) {
        throw new AppError(404, 'NOT_FOUND', 'Profile not found');
      }

      res.json({
        success: true,
        data: profile,
      });
    } else if (type === 'company') {
      const profile = await prisma.companyProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!profile) {
        throw new AppError(404, 'NOT_FOUND', 'Profile not found');
      }

      res.json({
        success: true,
        data: profile,
      });
    } else {
      throw new AppError(400, 'INVALID_TYPE', 'Profile type must be "professional" or "company"');
    }
  } catch (error) {
    next(error);
  }
};

export const searchProfessionals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const company = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!company) {
      throw new AppError(403, 'FORBIDDEN', 'Only companies can search for professionals');
    }

    const { skills, availability, minRate, maxRate, location } = req.query;

    const where: any = {};

    if (availability) {
      where.availability = availability;
    }

    if (minRate || maxRate) {
      where.hourlyRate = {};
      if (minRate) where.hourlyRate.gte = parseFloat(minRate as string);
      if (maxRate) where.hourlyRate.lte = parseFloat(maxRate as string);
    }

    if (location) {
      where.location = {
        contains: location as string,
        mode: 'insensitive',
      };
    }

    let professionals = await prisma.professionalProfile.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by skills if provided
    if (skills) {
      const skillsArray = (skills as string).split(',').map(s => s.trim().toLowerCase());
      professionals = professionals.filter(prof => {
        const profSkills = Array.isArray(prof.skills) 
          ? prof.skills 
          : typeof prof.skills === 'string' 
            ? JSON.parse(prof.skills as string)
            : [];
        return skillsArray.some(skill => 
          profSkills.some((ps: string) => ps.toLowerCase().includes(skill))
        );
      });
    }

    res.json({
      success: true,
      data: professionals,
    });
  } catch (error) {
    next(error);
  }
};
