import { z } from 'zod';

export const LeadStatusEnum = z.enum(['New', 'Contacted', 'Qualified', 'Converted', 'Lost']);

export const createLeadSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .regex(/^[\+]?[\d\s\-\(\)]{7,15}$/, 'Please provide a valid phone number')
    .trim(),
  company: z
    .string({ required_error: 'Company name is required' })
    .min(1, 'Company name is required')
    .max(100, 'Company name cannot exceed 100 characters')
    .trim(),
  status: LeadStatusEnum.optional().default('New'),
  notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional().default(''),
});

export const updateLeadSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z
    .string()
    .regex(/^[\+]?[\d\s\-\(\)]{7,15}$/, 'Please provide a valid phone number')
    .trim()
    .optional(),
  company: z.string().min(1).max(100).trim().optional(),
  status: LeadStatusEnum.optional(),
  notes: z.string().max(2000).optional(),
});

export const getLeadsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: LeadStatusEnum.optional(),
  company: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'status', 'score']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type GetLeadsQuery = z.infer<typeof getLeadsQuerySchema>;
