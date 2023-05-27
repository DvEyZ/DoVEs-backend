import express from 'express';
import LabController from '../controllers/Lab.controller';
import MachineController from '../controllers/Machine.controller';

const router = express.Router();

router.get('/', LabController.list);
router.post('/', LabController.create);
router.get('/:lab', LabController.fetch);
router.post('/:lab/command', LabController.command);
router.delete('/:lab', LabController.delete);

router.get('/:lab/machines', MachineController.list);
router.get('/:lab/machines/:machine', MachineController.fetch);
router.post('/:lab/machines/:machine/command', MachineController.command);

export default router;