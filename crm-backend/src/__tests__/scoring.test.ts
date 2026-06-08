import { calculateLeadScore } from '../utils/scoring';

describe('calculateLeadScore', () => {
  it('gives 15 points for a company email', () => {
    const result = calculateLeadScore({
      email: 'john@acme.com',
      status: 'New',
      notes: '',
      company: '',
    });
    const emailPoints = result.details.find((d) => d.reason.includes('Company'));
    expect(emailPoints?.points).toBe(15);
  });

  it('gives 5 points for a Gmail email', () => {
    const result = calculateLeadScore({
      email: 'john@gmail.com',
      status: 'New',
      notes: '',
      company: '',
    });
    const emailPoints = result.details.find((d) => d.reason.includes('Personal'));
    expect(emailPoints?.points).toBe(5);
  });

  it('gives +20 for Qualified status', () => {
    const result = calculateLeadScore({
      email: 'john@gmail.com',
      status: 'Qualified',
      notes: '',
      company: 'Acme',
    });
    const statusPoints = result.details.find((d) => d.reason.includes('Qualified'));
    expect(statusPoints?.points).toBe(20);
  });

  it('gives +10 for detailed notes', () => {
    const result = calculateLeadScore({
      email: 'john@gmail.com',
      status: 'New',
      notes: 'This is a detailed note with more than 100 characters so we can test note scoring functionality properly',
      company: 'Acme',
    });
    const notesPoints = result.details.find((d) => d.reason.includes('Detailed notes'));
    expect(notesPoints?.points).toBe(10);
  });

  it('gives +10 for company provided', () => {
    const result = calculateLeadScore({
      email: 'john@gmail.com',
      status: 'New',
      notes: '',
      company: 'Acme Corp',
    });
    const companyPoints = result.details.find((d) => d.reason.includes('Company provided'));
    expect(companyPoints?.points).toBe(10);
  });

  it('clamps score between 0 and 100', () => {
    const result = calculateLeadScore({
      email: 'john@acme.com',
      status: 'Converted',
      notes: 'This is a detailed note with more than 100 characters so we can test note scoring functionality properly',
      company: 'Acme Corp',
    });
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it('returns negative points for Lost status', () => {
    const result = calculateLeadScore({
      email: 'john@gmail.com',
      status: 'Lost',
      notes: '',
      company: '',
    });
    const lostPoints = result.details.find((d) => d.reason.includes('Lost'));
    expect(lostPoints?.points).toBe(-10);
  });
});
