import express from 'express';
import TemplateController from '../controllers/Template.controller';

const router = express.Router();

router.get('/', TemplateController.list);
router.post('/', TemplateController.create);
router.get('/:template', TemplateController.fetch);
router.put('/:template', TemplateController.update);
router.delete('/:template', TemplateController.delete);

export default router;