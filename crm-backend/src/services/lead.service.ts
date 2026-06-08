import { ILead } from '../models/Lead';
import { leadRepository, LeadFilter, LeadQueryOptions, PaginatedLeads } from '../repositories/lead.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { calculateLeadScore } from '../utils/scoring';
import { CreateLeadInput, UpdateLeadInput } from '../validators/lead.validator';

export class LeadService {
  async createLead(data: CreateLeadInput): Promise<ILead> {
    const { total: score } = calculateLeadScore({
      email: data.email,
      status: data.status || 'New',
      notes: data.notes || '',
      company: data.company,
    });

    const lead = await leadRepository.create({ ...data, score });

    // Fire-and-forget audit log
    auditLogRepository
      .create({
        action: 'LEAD_CREATED',
        leadId: lead._id.toString(),
        leadName: lead.name,
        details: { status: lead.status, score: lead.score },
      })
      .catch(console.error);

    return lead;
  }

  async getLeads(filter: LeadFilter, options: LeadQueryOptions): Promise<PaginatedLeads> {
    return leadRepository.findAll(filter, options);
  }

  async getLeadById(id: string): Promise<ILead | null> {
    return leadRepository.findById(id);
  }

  async updateLead(id: string, data: UpdateLeadInput): Promise<ILead | null> {
    const existing = await leadRepository.findById(id);
    if (!existing) return null;

    const newScore = calculateLeadScore({
      email: data.email || existing.email,
      status: data.status || existing.status,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      company: data.company || existing.company,
    }).total;

    const statusChanged = data.status && data.status !== existing.status;

    const timelineEntry = statusChanged
      ? {
          action: 'STATUS_CHANGED',
          description: `Status changed from ${existing.status} to ${data.status}`,
        }
      : {
          action: 'LEAD_UPDATED',
          description: `Lead information updated`,
        };

    const updated = await leadRepository.update(id, { ...data, score: newScore }, timelineEntry);

    if (updated) {
      const action = statusChanged ? 'STATUS_CHANGED' : 'LEAD_UPDATED';
      auditLogRepository
        .create({
          action,
          leadId: id,
          leadName: updated.name,
          details: {
            ...(statusChanged && { previousStatus: existing.status, newStatus: data.status }),
            score: newScore,
          },
        })
        .catch(console.error);
    }

    return updated;
  }

  async deleteLead(id: string): Promise<ILead | null> {
    const deleted = await leadRepository.delete(id);

    if (deleted) {
      auditLogRepository
        .create({
          action: 'LEAD_DELETED',
          leadId: id,
          leadName: deleted.name,
          details: { status: deleted.status },
        })
        .catch(console.error);
    }

    return deleted;
  }

  async getStats(): Promise<Record<string, number>> {
    return leadRepository.getStats();
  }

  async exportLeads(): Promise<ILead[]> {
    return leadRepository.findAllForExport();
  }
}

export const leadService = new LeadService();
