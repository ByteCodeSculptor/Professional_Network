import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

const createApplicationSchema = z.object({
  projectId: z.string().uuid(),
  coverLetter: z.string().optional(),
  proposedRate: z.number().positive().optional(),
  estimatedDuration: z.number().int().positive().optional(),
});

const updateApplicationSchema = z.object({
  status: z.enum(['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn']),
});

export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createApplicationSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    // Get professional profile
    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new AppError(403, 'FORBIDDEN', 'Only professionals can apply to projects');
    }

    // Check if project exists and is open
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.status !== 'open') {
      throw new AppError(400, 'INVALID_STATUS', 'Project is not accepting applications');
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        projectId_professionalId: {
          projectId: data.projectId,
          professionalId: professional.id,
        },
      },
    });

    if (existingApplication) {
      throw new AppError(409, 'ALREADY_APPLIED', 'You have already applied to this project');
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        projectId: data.projectId,
        professionalId: professional.id,
        coverLetter: data.coverLetter,
        proposedRate: data.proposedRate,
        estimatedDuration: data.estimatedDuration,
      },
      include: {
        project: {
          include: {
            company: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new AppError(403, 'FORBIDDEN', 'Only professionals can view applications');
    }

    const applications = await prisma.application.findMany({
      where: { professionalId: professional.id },
      include: {
        project: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            company: true,
          },
        },
        professional: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new AppError(404, 'NOT_FOUND', 'Application not found');
    }

    // Check authorization
    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
    });

    const company = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    const isOwner = professional?.id === application.professionalId;
    const isCompany = company?.id === application.project.companyId;

    if (!isOwner && !isCompany) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied');
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateApplicationSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!application) {
      throw new AppError(404, 'NOT_FOUND', 'Application not found');
    }

    // Check authorization
    const company = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!company || company.id !== application.project.companyId) {
      throw new AppError(403, 'FORBIDDEN', 'Only the project owner can update application status');
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status: data.status },
      include: {
        project: {
          include: {
            company: true,
          },
        },
        professional: true,
      },
    });

    res.json({
      success: true,
      data: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new AppError(403, 'FORBIDDEN', 'Only professionals can withdraw applications');
    }

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new AppError(404, 'NOT_FOUND', 'Application not found');
    }

    if (application.professionalId !== professional.id) {
      throw new AppError(403, 'FORBIDDEN', 'You can only withdraw your own applications');
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status: 'withdrawn' },
    });

    res.json({
      success: true,
      data: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    const company = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!company || company.id !== project.companyId) {
      throw new AppError(403, 'FORBIDDEN', 'Only the project owner can view applications');
    }

    const applications = await prisma.application.findMany({
      where: { projectId },
      include: {
        professional: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};
