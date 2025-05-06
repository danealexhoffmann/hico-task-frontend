import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeTable, { getDisplayColor } from './EmployeeTable';
import '@testing-library/jest-dom';

// Mock the EmployeeInfoForm component
vi.mock('./EmployeeInfoForm', () => {
  const EmployeeInfoFormMock = vi.fn().mockImplementation(({ employee, onSuccess, ref }) => {
    if (ref) {
      ref.current = {
        submitForm: vi.fn(),
      };
    }
    return (
      <div data-testid="employee-form">
        <button data-testid="success-button" onClick={onSuccess}>Success</button>
        <div data-testid="employee-data">{employee ? JSON.stringify(employee) : 'No employee'}</div>
      </div>
    );
  });
  EmployeeInfoFormMock.displayName = 'EmployeeInfoForm';
  return {
    __esModule: true,
    default: EmployeeInfoFormMock,
    EmployeeInfoFormHandle: {},
  };
});

describe('EmployeeTable Component', () => {
  // Mock fetch before each test
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  // Clean up after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render loading state initially', () => {
    // Mock fetch to return a pending promise
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(<EmployeeTable />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render error state when fetch fails', async () => {
    // Mock fetch to reject with an error
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    render(<EmployeeTable />);

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  it('should render employee data when fetch succeeds', async () => {
    // Mock successful fetch response
    const mockEmployees = {
      message: [
        {
          id: 1,
          employee_number: 1001,
          first_name: 'John',
          last_name: 'Doe',
          salutation: 'Mr',
          profile_colour: 'blue'
        },
        {
          id: 2,
          employee_number: 1002,
          first_name: 'Jane',
          last_name: 'Smith',
          salutation: 'Ms',
          profile_colour: 'red'
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmployees
    });

    render(<EmployeeTable />);

    // Wait for the table to be rendered
    await waitFor(() => {
      expect(screen.getByText('Current Employees')).toBeInTheDocument();
    });

    // Check if employee data is displayed
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('1001')).toBeInTheDocument();
    expect(screen.getByText('1002')).toBeInTheDocument();
  });

  it('should select an employee when row is clicked', async () => {
    // Mock successful fetch response
    const mockEmployees = {
      message: [
        {
          id: 1,
          employee_number: 1001,
          first_name: 'John',
          last_name: 'Doe',
          salutation: 'Mr',
          profile_colour: 'blue'
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmployees
    });

    render(<EmployeeTable />);

    // Wait for the table to be rendered
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // Click on the employee row
    fireEvent.click(screen.getByText('John'));

    // Check if the employee data is passed to the form
    await waitFor(() => {
      const employeeDataElement = screen.getByTestId('employee-data');
      expect(employeeDataElement.textContent).toContain('John');
      expect(employeeDataElement.textContent).toContain('Doe');
    });
  });

  it('should refresh table when onSuccess is called', async () => {
    // Mock successful fetch responses
    const mockEmployees1 = {
      message: [
        {
          id: 1,
          employee_number: 1001,
          first_name: 'John',
          last_name: 'Doe',
          salutation: 'Mr',
          profile_colour: 'blue'
        }
      ]
    };

    const mockEmployees2 = {
      message: [
        {
          id: 1,
          employee_number: 1001,
          first_name: 'John',
          last_name: 'Doe',
          salutation: 'Mr',
          profile_colour: 'blue'
        },
        {
          id: 2,
          employee_number: 1002,
          first_name: 'Jane',
          last_name: 'Smith',
          salutation: 'Ms',
          profile_colour: 'red'
        }
      ]
    };

    // First fetch returns mockEmployees1, second fetch returns mockEmployees2
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmployees1
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmployees2
      });

    render(<EmployeeTable />);

    // Wait for the initial table to be rendered
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // Verify Jane is not in the document yet
    expect(screen.queryByText('Jane')).not.toBeInTheDocument();

    // Trigger onSuccess (simulating form submission)
    fireEvent.click(screen.getByTestId('success-button'));

    // Wait for the table to refresh with new data
    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });

    // Verify fetch was called twice
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should call submitForm when Add Employee button is clicked', async () => {
    // Mock successful fetch response
    const mockEmployees = {
      message: []
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmployees
    });

    render(<EmployeeTable />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('add employee')).toBeInTheDocument();
    });

    // Get the mocked submitForm function
    const mockFormRef = screen.getByTestId('employee-form');
    const mockSubmitForm = vi.spyOn(mockFormRef, 'submitForm');

    // Click the Add Employee button
    fireEvent.click(screen.getByText('add employee'));

    // Check if selectedEmployee is null and submitForm was called
    expect(screen.getByTestId('employee-data').textContent).toBe('No employee');
    expect(mockSubmitForm).toHaveBeenCalled();
  });
});

describe('getDisplayColor function', () => {
  it('should return the correct hex color for known colors', () => {
    expect(getDisplayColor('red')).toBe('#ffcccc');
    expect(getDisplayColor('green')).toBe('#ccffcc');
    expect(getDisplayColor('blue')).toBe('#ccccff');
  });

  it('should return the input color for unknown colors', () => {
    expect(getDisplayColor('yellow')).toBe('yellow');
    expect(getDisplayColor('#123456')).toBe('#123456');
    expect(getDisplayColor('none')).toBe('none');
  });

  it('should handle empty string', () => {
    expect(getDisplayColor('')).toBe('');
  });
});