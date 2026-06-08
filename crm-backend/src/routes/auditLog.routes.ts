import { Router } from 'express';
import { auditLogController } from '../controllers/auditLog.controller';

const router = Router();

router.get('/', (req, res, next) => auditLogController.getAuditLogs(req, res, next));
router.get('/lead/:leadId', (req, res, next) => auditLogController.getAuditLogsByLead(req, res, next));

export default router;
