import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  updateConsentSchema,
  updatePreferenceSchema,
  createCategorySchema,
  paginationSchema,
} from '../validation';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate a valid email', () => {
      const result = loginSchema.parse({ email: 'test@example.com' });
      expect(result.email).toBe('test@example.com');
    });

    it('should reject an invalid email', () => {
      expect(() => loginSchema.parse({ email: 'invalid-email' })).toThrow();
    });

    it('should reject missing email', () => {
      expect(() => loginSchema.parse({})).toThrow();
    });
  });

  describe('updateConsentSchema', () => {
    it('should validate granted consent', () => {
      const result = updateConsentSchema.parse({
        categoryId: 'cat123',
        status: 'granted',
      });
      expect(result.status).toBe('granted');
      expect(result.categoryId).toBe('cat123');
    });

    it('should validate denied consent', () => {
      const result = updateConsentSchema.parse({
        categoryId: 'cat123',
        status: 'denied',
      });
      expect(result.status).toBe('denied');
    });

    it('should reject invalid status', () => {
      expect(() =>
        updateConsentSchema.parse({
          categoryId: 'cat123',
          status: 'maybe',
        })
      ).toThrow();
    });

    it('should reject missing categoryId', () => {
      expect(() =>
        updateConsentSchema.parse({
          status: 'granted',
        })
      ).toThrow();
    });
  });

  describe('updatePreferenceSchema', () => {
    it('should validate email preference', () => {
      const result = updatePreferenceSchema.parse({
        channel: 'email',
        frequency: 'normal',
      });
      expect(result.channel).toBe('email');
      expect(result.frequency).toBe('normal');
    });

    it('should validate all channels', () => {
      ['email', 'sms', 'push'].forEach((channel) => {
        const result = updatePreferenceSchema.parse({
          channel,
          frequency: 'low',
        });
        expect(result.channel).toBe(channel);
      });
    });

    it('should validate all frequencies', () => {
      ['none', 'low', 'normal', 'high'].forEach((frequency) => {
        const result = updatePreferenceSchema.parse({
          channel: 'email',
          frequency,
        });
        expect(result.frequency).toBe(frequency);
      });
    });

    it('should accept optional metaJson', () => {
      const result = updatePreferenceSchema.parse({
        channel: 'email',
        frequency: 'high',
        metaJson: { custom: 'data' },
      });
      expect(result.metaJson).toEqual({ custom: 'data' });
    });

    it('should reject invalid channel', () => {
      expect(() =>
        updatePreferenceSchema.parse({
          channel: 'telegram',
          frequency: 'normal',
        })
      ).toThrow();
    });
  });

  describe('createCategorySchema', () => {
    it('should validate a valid category', () => {
      const result = createCategorySchema.parse({
        key: 'analytics',
        name: 'Analytics',
        description: 'Track user behavior',
      });
      expect(result.key).toBe('analytics');
      expect(result.name).toBe('Analytics');
      expect(result.description).toBe('Track user behavior');
    });

    it('should allow optional description', () => {
      const result = createCategorySchema.parse({
        key: 'analytics',
        name: 'Analytics',
      });
      expect(result.description).toBeUndefined();
    });

    it('should reject empty key', () => {
      expect(() =>
        createCategorySchema.parse({
          key: '',
          name: 'Analytics',
        })
      ).toThrow();
    });

    it('should reject empty name', () => {
      expect(() =>
        createCategorySchema.parse({
          key: 'analytics',
          name: '',
        })
      ).toThrow();
    });
  });

  describe('paginationSchema', () => {
    it('should use default values', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should parse valid pagination params', () => {
      const result = paginationSchema.parse({ page: '2', limit: '20' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('should coerce string numbers', () => {
      const result = paginationSchema.parse({ page: '5', limit: '50' });
      expect(result.page).toBe(5);
      expect(result.limit).toBe(50);
    });

    it('should reject negative page', () => {
      expect(() => paginationSchema.parse({ page: -1 })).toThrow();
    });

    it('should reject zero page', () => {
      expect(() => paginationSchema.parse({ page: 0 })).toThrow();
    });

    it('should reject limit over 100', () => {
      expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
    });
  });
});
