import { AuditLog, IAuditLog, AuditAction } from '../models/AuditLog';

export interface CreateAuditLogInput {
  action: AuditAction;
  leadId: string;
  leadName: string;
  details?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asLog = (v: any): IAuditLog => v as IAuditLog;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asLogs = (v: any[]): IAuditLog[] => v as IAuditLog[];

export class AuditLogRepository {
  async create(data: CreateAuditLogInput): Promise<IAuditLog> {
    const log = new AuditLog({ ...data, timestamp: new Date() });
    return log.save();
  }

  async findAll(page = 1, limit = 20): Promise<{ logs: IAuditLog[]; total: number }> {
    const skip = (page - 1) * limit;
    const [raw, total] = await Promise.all([
      AuditLog.find({}).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments({}),
    ]);
    return { logs: asLogs(raw), total };
  }

  async findByLeadId(leadId: string): Promise<IAuditLog[]> {
    const raw = await AuditLog.find({ leadId }).sort({ timestamp: -1 }).lean();
    return asLogs(raw);
  }
}

export const auditLogRepository = new AuditLogRepository();
