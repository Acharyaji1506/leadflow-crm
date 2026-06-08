import { Router } from 'express';
import { leadController } from '../controllers/lead.controller';

const router = Router();

router.post('/', (req, res, next) => leadController.createLead(req, res, next));
router.get('/', (req, res, next) => leadController.getLeads(req, res, next));
router.get('/stats', (req, res, next) => leadController.getStats(req, res, next));
router.get('/export/csv', (req, res, next) => leadController.exportCSV(req, res, next));
router.get('/:id', (req, res, next) => leadController.getLeadById(req, res, next));
router.put('/:id', (req, res, next) => leadController.updateLead(req, res, next));
router.delete('/:id', (req, res, next) => leadController.deleteLead(req, res, next));

export default router;
