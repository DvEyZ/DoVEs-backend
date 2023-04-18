import express from 'express';
import machinesRouter from './Machines.routes';
import LabController from '../controllers/Lab.controller';

const router = express.Router();

router.get('/', LabController.list);
router.post('/', LabController.create);
router.get('/:lab', LabController.fetch);
router.post('/:lab', LabController.command);
router.delete('/:lab', LabController.delete);

router.use('/:lab/machines', machinesRouter)

export default router;