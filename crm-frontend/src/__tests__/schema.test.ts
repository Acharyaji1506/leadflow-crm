import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Replicate the same schema from LeadForm
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{7,15}$/, 'Invalid phone number'),
  company: z.string().min(1, 'Company is required').max(100),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Converted', 'Lost']),
  notes: z.string().max(2000).optional().default(''),
});

const valid = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  company: 'Acme Corp',
  status: 'New' as const,
  notes: 'Some notes',
};

describe('LeadForm schema validation', () => {
  it('validates a correct lead', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it('rejects short name', () => {
    const r = schema.safeParse({ ...valid, name: 'A' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.name?.[0]).toContain('2 characters');
    }
  });

  it('rejects invalid email', () => {
    expect(schema.safeParse({ ...valid, email: 'notanemail' }).success).toBe(false);
  });

  it('rejects invalid phone', () => {
    expect(schema.safeParse({ ...valid, phone: 'abc' }).success).toBe(false);
  });

  it('rejects empty company', () => {
    expect(schema.safeParse({ ...valid, company: '' }).success).toBe(false);
  });

  it('rejects invalid status', () => {
    expect(schema.safeParse({ ...valid, status: 'Invalid' as never }).success).toBe(false);
  });

  it('accepts all valid statuses', () => {
    const statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'] as const;
    for (const status of statuses) {
      expect(schema.safeParse({ ...valid, status }).success).toBe(true);
    }
  });

  it('defaults notes to empty string', () => {
    const { notes: _, ...withoutNotes } = valid;
    const r = schema.safeParse(withoutNotes);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.notes).toBe('');
  });
});
