import { createLeadSchema, updateLeadSchema, getLeadsQuerySchema } from '../validators/lead.validator';

describe('createLeadSchema', () => {
  const valid = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Acme Corp',
    status: 'New' as const,
    notes: 'Some notes',
  };

  it('validates a correct lead', () => {
    const result = createLeadSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = createLeadSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = createLeadSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone', () => {
    const result = createLeadSchema.safeParse({ ...valid, phone: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = createLeadSchema.safeParse({ ...valid, status: 'InvalidStatus' });
    expect(result.success).toBe(false);
  });

  it('defaults status to New when not provided', () => {
    const { status: _, ...withoutStatus } = valid;
    const result = createLeadSchema.safeParse(withoutStatus);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('New');
    }
  });

  it('lowercases email', () => {
    const result = createLeadSchema.safeParse({ ...valid, email: 'JOHN@EXAMPLE.COM' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('john@example.com');
    }
  });
});

describe('updateLeadSchema', () => {
  it('allows partial updates', () => {
    const result = updateLeadSchema.safeParse({ status: 'Contacted' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status in update', () => {
    const result = updateLeadSchema.safeParse({ status: 'Invalid' });
    expect(result.success).toBe(false);
  });
});

describe('getLeadsQuerySchema', () => {
  it('defaults page to 1 and limit to 10', () => {
    const result = getLeadsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe('1');
      expect(result.data.limit).toBe('10');
    }
  });

  it('accepts valid filter params', () => {
    const result = getLeadsQuerySchema.safeParse({
      status: 'Qualified',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid sortBy value', () => {
    const result = getLeadsQuerySchema.safeParse({ sortBy: 'invalid_field' });
    expect(result.success).toBe(false);
  });
});
