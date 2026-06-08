import { Request, Response, NextFunction } from 'express';
import { leadService } from '../services/lead.service';
import {
  createLeadSchema,
  updateLeadSchema,
  getLeadsQuerySchema,
} from '../validators/lead.validator';
import { sendSuccess, sendError, buildPagination } from '../utils/response';

export class LeadController {
  async createLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
        return;
      }
      const lead = await leadService.createLead(parsed.data);
      sendSuccess(res, lead, 'Lead created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = getLeadsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        sendError(res, 'Invalid query parameters', 400, parsed.error.flatten().fieldErrors);
        return;
      }

      const { page, limit, status, company, startDate, endDate, sortBy, sortOrder, search } =
        parsed.data;

      const filter = {
        ...(status && { status }),
        ...(company && { company }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(search && { search }),
      };

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      };

      const { leads, total } = await leadService.getLeads(filter, options);
      const pagination = buildPagination(parseInt(page), parseInt(limit), total);

      sendSuccess(res, leads, 'Leads retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  async getLeadById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const lead = await leadService.getLeadById(id);
      if (!lead) {
        sendError(res, 'Lead not found', 404);
        return;
      }
      sendSuccess(res, lead, 'Lead retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const parsed = updateLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
        return;
      }
      const lead = await leadService.updateLead(id, parsed.data);
      if (!lead) {
        sendError(res, 'Lead not found', 404);
        return;
      }
      sendSuccess(res, lead, 'Lead updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const lead = await leadService.deleteLead(id);
      if (!lead) {
        sendError(res, 'Lead not found', 404);
        return;
      }
      sendSuccess(res, lead, 'Lead deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await leadService.getStats();
      sendSuccess(res, stats, 'Statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const leads = await leadService.exportLeads();
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Notes', 'Score', 'Created Date'];
      const rows = leads.map((l) => [
        `"${l.name.replace(/"/g, '""')}"`,
        `"${l.email}"`,
        `"${l.phone}"`,
        `"${l.company.replace(/"/g, '""')}"`,
        `"${l.status}"`,
        `"${(l.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        l.score,
        `"${new Date(l.createdAt).toISOString()}"`,
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="leads_export_${Date.now()}.csv"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
}

export const leadController = new LeadController();
