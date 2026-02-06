/**
 * Tests for ADR Validation Module
 */

import { describe, it, expect } from '@jest/globals';
import {
  ADR,
  isValidISO8601,
  validateMetadata,
  validateOptionalFields,
  validateADRReferences
} from '../adr-validator';

describe('ADR Validator', () => {
  describe('isValidISO8601', () => {
    it('should accept valid ISO 8601 dates', () => {
      expect(isValidISO8601('2026-02-06')).toBe(true);
      expect(isValidISO8601('2024-01-01')).toBe(true);
      expect(isValidISO8601('2024-12-31')).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidISO8601('2024-02-30')).toBe(false); // Invalid day
      expect(isValidISO8601('2024-13-01')).toBe(false); // Invalid month
      expect(isValidISO8601('2024-00-01')).toBe(false); // Invalid month
      expect(isValidISO8601('2024-01-32')).toBe(false); // Invalid day
      expect(isValidISO8601('24-01-01')).toBe(false);   // Wrong format
      expect(isValidISO8601('2024/01/01')).toBe(false); // Wrong separator
      expect(isValidISO8601('2024-1-1')).toBe(false);   // Missing leading zeros
      expect(isValidISO8601('not-a-date')).toBe(false);
      expect(isValidISO8601('')).toBe(false);
    });
  });

  describe('validateMetadata', () => {
    it('should accept valid ADR metadata', () => {
      const validADR: ADR = {
        id: 'adr-0001',
        title: 'Use PostgreSQL for Primary Database',
        status: 'approved',
        date: '2026-02-06',
        deciders: ['Tech Lead', 'Database Architect']
      };

      const result = validateMetadata(validADR);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject missing required fields', () => {
      const invalidADR = {
        id: 'adr-0001',
        title: 'Test',
        status: 'approved'
      } as ADR;

      const result = validateMetadata(invalidADR);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: date');
      expect(result.errors).toContain('At least one decider must be specified');
    });

    it('should reject invalid ID format', () => {
      const invalidADR: ADR = {
        id: 'adr-1', // Should be adr-0001
        title: 'Valid Title Here',
        status: 'approved',
        date: '2026-02-06',
        deciders: ['Tech Lead']
      };

      const result = validateMetadata(invalidADR);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid ID format. Must be adr-NNNN (e.g., adr-0001)');
    });

    it('should reject invalid title length', () => {
      const shortTitle: ADR = {
        id: 'adr-0001',
        title: 'Short', // Less than 10 characters
        status: 'approved',
        date: '2026-02-06',
        deciders: ['Tech Lead']
      };

      const result = validateMetadata(shortTitle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Title must be 10-100 characters');
    });

    it('should reject invalid status', () => {
      const invalidStatus: ADR = {
        id: 'adr-0001',
        title: 'Valid Title Here',
        status: 'invalid-status',
        date: '2026-02-06',
        deciders: ['Tech Lead']
      };

      const result = validateMetadata(invalidStatus);
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('Invalid status'))).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidDate: ADR = {
        id: 'adr-0001',
        title: 'Valid Title Here',
        status: 'approved',
        date: '2024-02-30', // Invalid date
        deciders: ['Tech Lead']
      };

      const result = validateMetadata(invalidDate);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid date format. Must be ISO 8601 (YYYY-MM-DD)');
    });
  });

  describe('validateOptionalFields', () => {
    it('should accept valid optional fields', () => {
      const adr: ADR = {
        id: 'adr-0001',
        title: 'Valid Title Here',
        status: 'approved',
        date: '2026-02-06',
        deciders: ['Tech Lead'],
        tags: ['database', 'postgresql'],
        supersedes: ['adr-0002'],
        superseded_by: 'adr-0003'
      };

      const result = validateOptionalFields(adr);
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual([]);
    });

    it('should warn about invalid supersedes format', () => {
      const adr: ADR = {
        id: 'adr-0001',
        title: 'Valid Title Here',
        status: 'approved',
        date: '2026-02-06',
        deciders: ['Tech Lead'],
        supersedes: ['adr-1', 'invalid-id'] // Invalid formats
      };

      const result = validateOptionalFields(adr);
      expect(result.valid).toBe(false);
      expect(result.warnings?.some(w => w.includes('Invalid ADR ID in supersedes'))).toBe(true);
    });
  });

  describe('validateADRReferences', () => {
    const existingADRs: ADR[] = [
      {
        id: 'adr-0001',
        title: 'First Decision',
        status: 'approved',
        date: '2026-01-01',
        deciders: ['Tech Lead']
      },
      {
        id: 'adr-0002',
        title: 'Second Decision',
        status: 'approved',
        date: '2026-01-02',
        deciders: ['Tech Lead']
      }
    ];

    it('should warn when related_decisions references non-existent ADR', () => {
      const adr: ADR = {
        id: 'adr-0003',
        title: 'Third Decision',
        status: 'approved',
        date: '2026-01-03',
        deciders: ['Tech Lead'],
        related_decisions: ['adr-0001', 'adr-9999'] // adr-9999 doesn't exist
      };

      const result = validateADRReferences(adr, existingADRs);
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('Related ADR does not exist: adr-9999');
    });

    it('should pass when all references exist', () => {
      const adr: ADR = {
        id: 'adr-0003',
        title: 'Third Decision',
        status: 'approved',
        date: '2026-01-03',
        deciders: ['Tech Lead'],
        related_decisions: ['adr-0001', 'adr-0002']
      };

      const result = validateADRReferences(adr, existingADRs);
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual([]);
    });
  });
});

