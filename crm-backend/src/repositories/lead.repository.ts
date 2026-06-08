import { FilterQuery } from 'mongoose';
import { Lead, ILead, LeadStatus } from '../models/Lead';
import { CreateLeadInput, UpdateLeadInput } from '../validators/lead.validator';

export interface LeadFilter {
  status?: LeadStatus;
  company?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface LeadQueryOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedLeads {
  leads: ILead[];
  total: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asLead = (v: any): ILead => v as ILead;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asLeads = (v: any[]): ILead[] => v as ILead[];

export class LeadRepository {
  async create(data: CreateLeadInput & { score: number }): Promise<ILead> {
    const lead = new Lead({
      ...data,
      timeline: [
        {
          action: 'LEAD_CREATED',
          description: `Lead "${data.name}" was created`,
          timestamp: new Date(),
        },
      ],
    });
    return lead.save();
  }

  async findById(id: string): Promise<ILead | null> {
    const result = await Lead.findById(id).lean();
    return result ? asLead(result) : null;
  }

  async findAll(filter: LeadFilter, options: LeadQueryOptions): Promise<PaginatedLeads> {
    const query: FilterQuery<ILead> = {};

    if (filter.status) query.status = filter.status;
    if (filter.company) query.company = { $regex: filter.company, $options: 'i' };
    if (filter.startDate || filter.endDate) {
      query.createdAt = {};
      if (filter.startDate) query.createdAt.$gte = filter.startDate;
      if (filter.endDate) query.createdAt.$lte = filter.endDate;
    }
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
        { company: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const skip = (options.page - 1) * options.limit;
    const sortDir = options.sortOrder === 'asc' ? 1 : -1;

    const [raw, total] = await Promise.all([
      Lead.find(query)
        .sort({ [options.sortBy]: sortDir })
        .skip(skip)
        .limit(options.limit)
        .lean(),
      Lead.countDocuments(query),
    ]);

    return { leads: asLeads(raw), total };
  }

  async findAllForExport(): Promise<ILead[]> {
    const raw = await Lead.find({}).sort({ createdAt: -1 }).lean();
    return asLeads(raw);
  }

  async update(
    id: string,
    data: UpdateLeadInput & { score?: number },
    timelineEntry?: { action: string; description: string }
  ): Promise<ILead | null> {
    const updateOp: Record<string, unknown> = { $set: { ...data } };
    if (timelineEntry) {
      updateOp['$push'] = { timeline: { ...timelineEntry, timestamp: new Date() } };
    }
    const result = await Lead.findByIdAndUpdate(id, updateOp, { new: true, runValidators: true }).lean();
    return result ? asLead(result) : null;
  }

  async delete(id: string): Promise<ILead | null> {
    const result = await Lead.findByIdAndDelete(id).lean();
    return result ? asLead(result) : null;
  }

  async getStats(): Promise<Record<string, number>> {
    const stats = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result: Record<string, number> = {
      total: 0, New: 0, Contacted: 0, Qualified: 0, Converted: 0, Lost: 0,
    };

    for (const s of stats) {
      result[s._id as string] = s.count;
      result.total += s.count;
    }

    const firstLead = await Lead.findOne({}).sort({ createdAt: 1 });
    if (firstLead && result.total > 0) {
      const daysDiff = Math.max(
        1,
        Math.ceil((Date.now() - new Date(firstLead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      );
      result.avgPerDay = parseFloat((result.total / daysDiff).toFixed(2));
    } else {
      result.avgPerDay = 0;
    }

    result.conversionRate =
      result.total > 0 ? parseFloat(((result.Converted / result.total) * 100).toFixed(1)) : 0;
    result.lostRate =
      result.total > 0 ? parseFloat(((result.Lost / result.total) * 100).toFixed(1)) : 0;

    return result;
  }
}

export const leadRepository = new LeadRepository();
