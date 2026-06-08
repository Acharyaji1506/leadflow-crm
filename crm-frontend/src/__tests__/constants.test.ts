import { describe, it, expect } from 'vitest';
import { SCORE_TIER, STATUS_CONFIG, LEAD_STATUSES } from '../constants/index';

describe('SCORE_TIER', () => {
  it('returns Hot for score >= 60', () => {
    expect(SCORE_TIER(75).label).toBe('Hot');
    expect(SCORE_TIER(60).label).toBe('Hot');
  });

  it('returns Warm for score 35–59', () => {
    expect(SCORE_TIER(50).label).toBe('Warm');
    expect(SCORE_TIER(35).label).toBe('Warm');
  });

  it('returns Cold for score < 35', () => {
    expect(SCORE_TIER(10).label).toBe('Cold');
    expect(SCORE_TIER(0).label).toBe('Cold');
  });
});

describe('STATUS_CONFIG', () => {
  it('has config for all 5 statuses', () => {
    expect(Object.keys(STATUS_CONFIG)).toEqual(LEAD_STATUSES);
  });

  it('each status has required fields', () => {
    for (const status of LEAD_STATUSES) {
      const config = STATUS_CONFIG[status];
      expect(config.label).toBeDefined();
      expect(config.color).toBeDefined();
      expect(config.bg).toBeDefined();
      expect(config.border).toBeDefined();
      expect(config.dot).toBeDefined();
    }
  });
});

describe('LEAD_STATUSES', () => {
  it('contains exactly 5 statuses', () => {
    expect(LEAD_STATUSES).toHaveLength(5);
  });

  it('contains expected status values', () => {
    expect(LEAD_STATUSES).toContain('New');
    expect(LEAD_STATUSES).toContain('Contacted');
    expect(LEAD_STATUSES).toContain('Qualified');
    expect(LEAD_STATUSES).toContain('Converted');
    expect(LEAD_STATUSES).toContain('Lost');
  });
});
