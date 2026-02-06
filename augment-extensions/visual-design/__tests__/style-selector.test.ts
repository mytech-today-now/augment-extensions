/**
 * Style Selector Tests
 *
 * Comprehensive unit and integration tests for the style selector module,
 * including vendor priority, fallback logic, and preference handling.
 */

import {
  createStyleSelector,
  defaultStyleSelector,
  selectVendorStyle,
  getVendorStyle,
  getAllVendorStyles,
  hasVendorStyle,
  DEFAULT_VENDOR_PRIORITY
} from '../style-selector';
import { GOOGLE_MODERN } from '../domains/web-page-styles/google-modern';
import { MICROSOFT_FLUENT } from '../domains/web-page-styles/microsoft-fluent';
import { AMAZON_CLOUDSCAPE } from '../domains/web-page-styles/amazon-cloudscape';

describe('Style Selector', () => {
  describe('DEFAULT_VENDOR_PRIORITY', () => {
    it('should have correct default priority order', () => {
      expect(DEFAULT_VENDOR_PRIORITY).toEqual(['google', 'microsoft', 'amazon']);
    });
  });

  describe('createStyleSelector', () => {
    it('should create selector with default priority', () => {
      const selector = createStyleSelector();
      expect(selector.vendorPriority).toEqual(['google', 'microsoft', 'amazon']);
      expect(selector.fallbackChain).toEqual(['google', 'microsoft', 'amazon']);
    });

    it('should create selector with custom priority', () => {
      const customPriority = ['amazon', 'microsoft', 'google'];
      const selector = createStyleSelector(customPriority);
      expect(selector.vendorPriority).toEqual(customPriority);
      expect(selector.fallbackChain).toEqual(customPriority);
    });
  });

  describe('defaultStyleSelector', () => {
    it('should be initialized with default priority', () => {
      expect(defaultStyleSelector.vendorPriority).toEqual(['google', 'microsoft', 'amazon']);
    });

    it('should select Google Modern by default', () => {
      const style = defaultStyleSelector.selectStyle();
      expect(style).toBe(GOOGLE_MODERN);
      expect(style.vendor).toBe('google');
    });
  });

  describe('selectStyle with preferences', () => {
    it('should select Google Modern when vendor is "google"', () => {
      const style = defaultStyleSelector.selectStyle({ vendor: 'google' });
      expect(style).toBe(GOOGLE_MODERN);
      expect(style.vendor).toBe('google');
    });

    it('should select Microsoft Fluent when vendor is "microsoft"', () => {
      const style = defaultStyleSelector.selectStyle({ vendor: 'microsoft' });
      expect(style).toBe(MICROSOFT_FLUENT);
      expect(style.vendor).toBe('microsoft');
    });

    it('should select Amazon Cloudscape when vendor is "amazon"', () => {
      const style = defaultStyleSelector.selectStyle({ vendor: 'amazon' });
      expect(style).toBe(AMAZON_CLOUDSCAPE);
      expect(style.vendor).toBe('amazon');
    });

    it('should be case-insensitive for vendor names', () => {
      const styleUpper = defaultStyleSelector.selectStyle({ vendor: 'GOOGLE' });
      const styleMixed = defaultStyleSelector.selectStyle({ vendor: 'GoOgLe' });
      expect(styleUpper).toBe(GOOGLE_MODERN);
      expect(styleMixed).toBe(GOOGLE_MODERN);
    });

    it('should fallback to priority chain for invalid vendor', () => {
      const style = defaultStyleSelector.selectStyle({ vendor: 'invalid' });
      expect(style).toBe(GOOGLE_MODERN); // First in default priority
    });

    it('should fallback to Google Modern when no vendor matches', () => {
      const selector = createStyleSelector(['nonexistent']);
      const style = selector.selectStyle();
      expect(style).toBe(GOOGLE_MODERN);
    });
  });

  describe('selectStyle with custom priority', () => {
    it('should respect custom priority order', () => {
      const selector = createStyleSelector(['amazon', 'microsoft', 'google']);
      const style = selector.selectStyle();
      expect(style).toBe(AMAZON_CLOUDSCAPE);
    });

    it('should fallback through custom chain', () => {
      const selector = createStyleSelector(['invalid1', 'microsoft', 'google']);
      const style = selector.selectStyle();
      expect(style).toBe(MICROSOFT_FLUENT);
    });
  });

  describe('selectVendorStyle', () => {
    it('should select Google Modern by default', () => {
      const style = selectVendorStyle();
      expect(style).toBe(GOOGLE_MODERN);
    });

    it('should respect vendor preference', () => {
      const style = selectVendorStyle({ vendor: 'microsoft' });
      expect(style).toBe(MICROSOFT_FLUENT);
    });
  });

  describe('getVendorStyle', () => {
    it('should return Google Modern for "google"', () => {
      expect(getVendorStyle('google')).toBe(GOOGLE_MODERN);
    });

    it('should return Microsoft Fluent for "microsoft"', () => {
      expect(getVendorStyle('microsoft')).toBe(MICROSOFT_FLUENT);
    });

    it('should return Amazon Cloudscape for "amazon"', () => {
      expect(getVendorStyle('amazon')).toBe(AMAZON_CLOUDSCAPE);
    });

    it('should return undefined for invalid vendor', () => {
      expect(getVendorStyle('invalid')).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      expect(getVendorStyle('GOOGLE')).toBe(GOOGLE_MODERN);
      expect(getVendorStyle('MicroSoft')).toBe(MICROSOFT_FLUENT);
    });
  });

  describe('getAllVendorStyles', () => {
    it('should return all three vendor styles', () => {
      const styles = getAllVendorStyles();
      expect(styles).toHaveLength(3);
      expect(styles).toContain(GOOGLE_MODERN);
      expect(styles).toContain(MICROSOFT_FLUENT);
      expect(styles).toContain(AMAZON_CLOUDSCAPE);
    });
  });

  describe('hasVendorStyle', () => {
    it('should return true for valid vendors', () => {
      expect(hasVendorStyle('google')).toBe(true);
      expect(hasVendorStyle('microsoft')).toBe(true);
      expect(hasVendorStyle('amazon')).toBe(true);
    });

    it('should return false for invalid vendors', () => {
      expect(hasVendorStyle('invalid')).toBe(false);
      expect(hasVendorStyle('apple')).toBe(false);
      expect(hasVendorStyle('')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(hasVendorStyle('GOOGLE')).toBe(true);
      expect(hasVendorStyle('MicroSoft')).toBe(true);
      expect(hasVendorStyle('AMAZON')).toBe(true);
    });
  });
});

