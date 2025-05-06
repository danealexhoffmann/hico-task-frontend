import { describe, it, expect } from 'vitest';
import { getDisplayColor, formatSalaryValue } from './EmployeeInfoForm';

describe('getDisplayColor', () => {
  it('should return the correct hex color for red', () => {
    expect(getDisplayColor('red')).toBe('#ffcccc');
  });

  it('should return the correct hex color for green', () => {
    expect(getDisplayColor('green')).toBe('#ccffcc');
  });

  it('should return the correct hex color for blue', () => {
    expect(getDisplayColor('blue')).toBe('#ccccff');
  });

  it('should return the input color if not in the color map', () => {
    expect(getDisplayColor('purple')).toBe('purple');
    expect(getDisplayColor('#123456')).toBe('#123456');
    expect(getDisplayColor('none')).toBe('none');
  });
});

describe('formatSalaryValue', () => {
    it('should format numbers with spaces as thousand separators', () => {
      expect(formatSalaryValue('1000')).toBe('1 000');
      expect(formatSalaryValue('1000000')).toBe('1 000 000');
    });

    it('should handle empty strings', () => {
      expect(formatSalaryValue('')).toBe('');
    });

    it('should handle strings with non-numeric characters', () => {
      // This test depends on implementation - if formatSalaryValue is expected to handle
      // cleaning input or just formatting already clean input
      expect(formatSalaryValue('1000abc')).toBe('1 000abc');
    });
  });