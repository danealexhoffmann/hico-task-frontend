import { describe, it, expect } from 'vitest';
import { getDisplayColor, formatSalaryValue } from './EmployeeInfoForm';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EmployeeInfoForm from './EmployeeInfoForm';

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

  describe('EmployeeInfoForm Component', () => {
    it('should initialize with empty form when no employee is provided', () => {
      const onSuccess = vi.fn();
      render(<EmployeeInfoForm employee={null} onSuccess={onSuccess} />);

      expect(screen.getByLabelText('First Name')).toHaveValue('');
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
      expect(screen.getByLabelText('Employee #')).toHaveValue(0);
      // Check other initial values
    });

    it('should populate form with employee data when provided', () => {
      const onSuccess = vi.fn();
      const mockEmployee = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        salutation: 'Mr' as const,
        gender: 'male' as const,
        employee_number: 12345,
        gross_salary: '75000',
        profile_colour: 'blue' as const
      };

      render(<EmployeeInfoForm employee={mockEmployee} onSuccess={onSuccess} />);

      expect(screen.getByLabelText('First Name')).toHaveValue('John');
      expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
      expect(screen.getByLabelText('Employee #')).toHaveValue(12345);
      expect(screen.getByLabelText('Full Name')).toHaveValue('John Doe');
      // Check other populated values
    });
  });

  describe('Form Input Handling', () => {
    it('should update firstName with sanitized value', async () => {
      const onSuccess = vi.fn();
      render(<EmployeeInfoForm employee={null} onSuccess={onSuccess} />);

      const input = screen.getByLabelText('First Name');
      await userEvent.type(input, 'John123');

      // Should strip non-alphabetic characters
      expect(input).toHaveValue('John');
    });

    it('should format salary input correctly', async () => {
      const onSuccess = vi.fn();
      render(<EmployeeInfoForm employee={null} onSuccess={onSuccess} />);

      const input = screen.getByLabelText(/Gross Salary/i);
      await userEvent.type(input, '75000');

      expect(input).toHaveValue('75 000');
    });

    it('should update gender when certain salutations are selected', () => {
      const onSuccess = vi.fn();
      render(<EmployeeInfoForm employee={null} onSuccess={onSuccess} />);

      // Open salutation dropdown
      fireEvent.mouseDown(screen.getByLabelText('Salutation'));
      // Select 'Mr'
      fireEvent.click(screen.getByText('Mr'));

      // Check that gender was automatically set to male
      const maleRadio = screen.getByLabelText('Male');
      expect(maleRadio).toBeChecked();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      // Mock fetch API
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should call POST API when submitting new employee', async () => {
      const onSuccess = vi.fn();
      const mockFetchResponse = {
        ok: true,
        json: () => Promise.resolve({ message: 'Success', employeeNumber: 12345 })
      };
      global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

      render(<EmployeeInfoForm employee={null} onSuccess={onSuccess} />);

      // Fill out form
      await userEvent.type(screen.getByLabelText('First Name'), 'Jane');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Smith');
      // Fill other required fields...

      // Submit form
      fireEvent.click(screen.getByText('Save'));

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith('/api/employees', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));

      // Verify onSuccess callback was called
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should call PUT API when updating existing employee', async () => {
      const onSuccess = vi.fn();
      const mockEmployee = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        salutation: 'Mr' as const,
        gender: 'male' as const,
        employee_number: 12345,
        gross_salary: '75000',
        profile_colour: 'blue' as const
      };

      const mockFetchResponse = {
        ok: true,
        json: () => Promise.resolve({ message: 'Success', employeeNumber: 12345 })
      };
      global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

      render(<EmployeeInfoForm employee={mockEmployee} onSuccess={onSuccess} />);

      // Update a field
      await userEvent.clear(screen.getByLabelText('First Name'));
      await userEvent.type(screen.getByLabelText('First Name'), 'Jonathan');

      // Submit form
      fireEvent.click(screen.getByText('Save'));

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith('/api/employees/1', expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));

      // Verify onSuccess callback was called
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const onSuccess = vi.fn();
      const mockFetchResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' })
      };
      global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<EmployeeInfoForm employee={null} onSuccess={onSuccess} />);

      // Fill out form minimally
      await userEvent.type(screen.getByLabelText('First Name'), 'Test');

      // Submit form
      fireEvent.click(screen.getByText('Save'));

      // Verify error handling
      expect(onSuccess).not.toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith('Failed to add employee. Please try again.');
    });
  });

  describe('Form Reset Functionality', () => {
    it('should reset form to initial empty state when Cancel is clicked with no employee', async () => {
      const onSuccess = vi.fn();
      render(<EmployeeInfoForm employee={null} onSuccess={onSuccess} />);

      // Fill out form
      await userEvent.type(screen.getByLabelText('First Name'), 'Jane');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Smith');

      // Click Cancel
      fireEvent.click(screen.getByText('Cancel'));

      // Verify form was reset
      expect(screen.getByLabelText('First Name')).toHaveValue('');
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
    });

    it('should reset form to employee data when Cancel is clicked with employee', async () => {
      const onSuccess = vi.fn();
      const mockEmployee = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        salutation: 'Mr' as const,
        gender: 'male' as const,
        employee_number: 12345,
        gross_salary: '75000',
        profile_colour: 'blue' as const
      };

      render(<EmployeeInfoForm employee={mockEmployee} onSuccess={onSuccess} />);

      // Change form data
      await userEvent.clear(screen.getByLabelText('First Name'));
      await userEvent.type(screen.getByLabelText('First Name'), 'Jane');

      // Click Cancel
      fireEvent.click(screen.getByText('Cancel'));

      // Verify form was reset to original employee data
      expect(screen.getByLabelText('First Name')).toHaveValue('John');
    });
  });

  describe('Imperative Handle', () => {
    it('should expose submitForm method via ref', async () => {
      const onSuccess = vi.fn();
      const mockFetchResponse = {
        ok: true,
        json: () => Promise.resolve({ message: 'Success', employeeNumber: 12345 })
      };
      global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

      // Create a ref to access the imperative handle
      const formRef = React.createRef<EmployeeInfoFormHandle>();

      render(<EmployeeInfoForm ref={formRef} employee={null} onSuccess={onSuccess} />);

      // Fill out form
      await userEvent.type(screen.getByLabelText('First Name'), 'Jane');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Smith');

      // Call submitForm via ref
      formRef.current?.submitForm();

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });