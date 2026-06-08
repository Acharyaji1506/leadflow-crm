import { Request, Response, NextFunction } from 'express';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { sendSuccess, sendError, buildPagination } from '../utils/response';

export class AuditLogController {
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt((req.query.page as string) || '1');
      const limit = parseInt((req.query.limit as string) || '20');

      if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 100) {
        sendError(res, 'Invalid pagination parameters', 400);
        return;
      }

      const { logs, total } = await auditLogRepository.findAll(page, limit);
      const pagination = buildPagination(page, limit, total);
      sendSuccess(res, logs, 'Audit logs retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogsByLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leadId } = req.params;
      const logs = await auditLogRepository.findByLeadId(leadId);
      sendSuccess(res, logs, 'Lead audit logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const auditLogController = new AuditLogController();
