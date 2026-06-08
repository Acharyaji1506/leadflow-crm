import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, timeAgo } from '../utils/cn';

describe('formatDate', () => {
  it('formats ISO date string to readable date', () => {
    const result = formatDate('2024-03-15T10:00:00.000Z');
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/2024/);
  });
});

describe('formatDateTime', () => {
  it('formats ISO date to date + time string', () => {
    const result = formatDateTime('2024-03-15T10:00:00.000Z');
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/2024/);
  });
});

describe('timeAgo', () => {
  it('returns "Just now" for very recent dates', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('Just now');
  });

  it('returns minutes ago for recent dates', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinutesAgo)).toBe('5m ago');
  });

  it('returns hours ago for dates a few hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days ago for dates a few days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe('2d ago');
  });
});
