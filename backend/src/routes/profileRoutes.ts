import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', profileController.getMyProfile);
router.put('/me', profileController.updateMyProfile);
router.get('/search/professionals', profileController.searchProfessionals);
router.get('/:id', profileController.getProfileById);

export default router;
