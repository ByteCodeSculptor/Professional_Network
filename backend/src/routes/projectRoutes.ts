import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  publishProject,
  deleteProject,
} from '../controllers/projectController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('company'), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', authenticate, authorize('company'), updateProject);
router.post('/:id/publish', authenticate, authorize('company'), publishProject);
router.delete('/:id', authenticate, authorize('company'), deleteProject);

export default router;