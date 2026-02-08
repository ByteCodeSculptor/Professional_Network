import { Router } from 'express';
import * as applicationController from '../controllers/applicationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', applicationController.createApplication);
router.get('/my-applications', applicationController.getMyApplications);
router.get('/:id', applicationController.getApplicationById);
router.patch('/:id/status', applicationController.updateApplicationStatus);
router.patch('/:id/withdraw', applicationController.withdrawApplication);
router.get('/project/:projectId', applicationController.getProjectApplications);

export default router;
