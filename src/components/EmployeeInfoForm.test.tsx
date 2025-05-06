import { describe, it, expect } from 'vitest';
import { getDisplayColor } from './EmployeeInfoForm';

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