import express from 'express';
import MachineController from '../controllers/Machine.controller';

const router = express.Router();

router.get('/', MachineController.list);
router.get('/:machine', MachineController.fetch);
router.post('/:machine', MachineController.command);

export default router;