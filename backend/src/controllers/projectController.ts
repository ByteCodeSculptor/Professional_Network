import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const createProjectSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(10).max(5000),
  requiredSkills: z.array(z.string()).min(1).max(20),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  durationWeeks: z.number().int().positive().optional(),
  deadline: z.string().datetime().optional(),
  status: z.enum(['draft', 'open']).optional(),
});

export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.sub;
    const data = createProjectSchema.parse(req.body);

    // Get company profile
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      throw new AppError(404, 'NOT_FOUND', 'Company profile not found');
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        companyId: companyProfile.id,
        title: data.title,
        description: data.description,
        requiredSkills: data.requiredSkills,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        durationWeeks: data.durationWeeks,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: data.status || 'draft',
        publishedAt: data.status === 'open' ? new Date() : null,
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
          },
        },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      skills,
      status = 'open',
      minBudget,
      maxBudget,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: status as string,
    };

    if (skills) {
      const skillsArray = (skills as string).split(',');
      where.requiredSkills = {
        path: '$',
        array_contains: skillsArray,
      };
    }

    if (minBudget) {
      where.budgetMax = { gte: parseFloat(minBudget as string) };
    }

    if (maxBudget) {
      where.budgetMin = { lte: parseFloat(maxBudget as string) };
    }

    // Full-text search would be implemented with raw SQL
    // For now, using simple contains
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              location: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            location: true,
            description: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.sub;
    const data = createProjectSchema.partial().parse(req.body);

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.company.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this project');
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const publishProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.sub;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.company.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to publish this project');
    }

    if (project.status !== 'draft') {
      throw new AppError(400, 'INVALID_STATUS', 'Only draft projects can be published');
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        status: 'open',
        publishedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.sub;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.company.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this project');
    }

    if (project._count.applications > 0) {
      throw new AppError(400, 'HAS_APPLICATIONS', 'Cannot delete project with applications');
    }

    await prisma.project.delete({ where: { id } });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};