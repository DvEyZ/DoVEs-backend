import express from 'express';
import LoginProviderController from '../controllers/LoginProvider.controller';

const router = express.Router();

router.get('/', LoginProviderController.list);
router.post('/', LoginProviderController.create);
router.get('/:provider', LoginProviderController.fetch);
router.put('/:provider', LoginProviderController.update);
router.delete('/:provider', LoginProviderController.delete);

export default router;