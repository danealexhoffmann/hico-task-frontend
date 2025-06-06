import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormLabel, FormControlLabel, RadioGroup, Radio, Box, Button, Stack } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

export type EmployeeInfoFormHandle = {
    submitForm: () => void;
}

type EmployeeInfoFormProps = {
    employee: {
        id: number;
        first_name: string;
        last_name: string;
        salutation: 'Dr' | 'Mr' | 'Mrs' | 'Ms' | 'Mx';
        gender: 'male' | 'female' | 'unspecified';
        employee_number: number;
        gross_salary: string;
        profile_colour: 'green' | 'blue' | 'red' | 'none';
    } | null;
    onSuccess: () => void;
};

type ApiResponse = {
    message: string;
    employeeNumber: number;
    error?: string;
}

export const getDisplayColor = (dbColor: string): string => {
    const colorMap: Record<string, string> = {
      'red': '#ffcccc',
      'green': '#ccffcc',
      'blue': '#ccccff',
    };

    return colorMap[dbColor] || dbColor;
  };

export const formatSalaryValue = (salaryString: string) => {
    const formattedString = salaryString.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return formattedString;
}

const EmployeeInfoForm = forwardRef<EmployeeInfoFormHandle, EmployeeInfoFormProps>(({ employee, onSuccess }, ref) => {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        salutation: '',
        gender: '',
        employeeNumber: 0,
        grossSalary: '',
        profileColour: 'none',
    })



    useEffect(() => {
        if (employee) {
            setFormData({
                firstName: employee.first_name,
                lastName: employee.last_name,
                salutation: employee.salutation,
                gender: employee.gender,
                employeeNumber: employee.employee_number,
                grossSalary: formatSalaryValue(employee.gross_salary),
                profileColour: employee.profile_colour
            });
        }
    }, [employee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'employeeNumber') {
        setFormData(prev => ({
            ...prev,
            [name]: value ? parseFloat(value) : 0
        }));
    }
    else if (name === 'grossSalary') {

        const numericString = value.replace(/[^\d]/g, '');
        const formattedNumericString = formatSalaryValue(numericString);

        setFormData(prev => ({
            ...prev,
            [name]: formattedNumericString
        }));
    }
    else {
    const sanitizedValue = value.replace(/[^a-zA-Z\s\-\u00C0-\u024F]/g, '');
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    const updatedData = {
        ...formData,
        [name]: value
    };

    if (name === 'salutation') {
        switch (value) {
            case 'Mr':
              updatedData.gender = 'male';
              break;
            case 'Mrs':
            case 'Ms':
              updatedData.gender = 'female';
              break;
            default:
              // Don't update for gender nueutral options
              break;
    }
}

    setFormData(updatedData);
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (employee) {

        //Update current employee data

        const updatedEmployeeData = {
            id: employee.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            salutation: formData.salutation,
            gender: formData.gender,
            employeeNumber: formData.employeeNumber,
            grossSalary: formData.grossSalary,
            profileColour: formData.profileColour
        }

        try {
            const response = await fetch(`/api/employees/${employee.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEmployeeData),
            });

            const data: ApiResponse = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update employee');
            }
            onSuccess();

        } catch (error) {
            console.error('Error adding employee:', error);
            alert('Failed to update employee. Please try again.');
        }
    } else {
        // Submit new employee data

        const newEmployeeData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            salutation: formData.salutation,
            gender: formData.gender,
            employeeNumber: formData.employeeNumber,
            grossSalary: formData.grossSalary,
            profileColour: formData.profileColour
        }

        try {
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEmployeeData),
            });

            const data: ApiResponse = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add employee');
            }
            onSuccess();

            setFormData({
                firstName: '',
                lastName: '',
                salutation: '',
                gender: '',
                employeeNumber: 0,
                grossSalary: '',
                profileColour: 'none'
            })
        } catch (error) {
            console.error('Error adding employee:', error);
            alert('Failed to add employee. Please try again.');
        }
    }


};

  const handleReset = () => {

    if (employee) {
        setFormData({
            firstName: employee.first_name,
            lastName: employee.last_name,
            salutation: employee.salutation,
            gender: employee.gender,
            employeeNumber: employee.employee_number,
            grossSalary: formatSalaryValue(employee.gross_salary),
            profileColour: employee.profile_colour
        });
    } else {
       setFormData({
        firstName: '',
        lastName: '',
        salutation: '',
        gender: '',
        employeeNumber: 0,
        grossSalary: '',
        profileColour: 'none',
       });
    }
  }

  useImperativeHandle(ref, () => ({
    submitForm: () => {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
}));

   return (
    <>
        <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Typography variant="subtitle2">Employee Information</Typography>
            <div>
            <Button onClick={handleReset}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: getDisplayColor(`${formData.profileColour}`), color: formData.profileColour === 'none' ? 'white' : 'black' }}
            >
              Save
            </Button>
            </div>
        </Box>
            <Grid container spacing={8} >
                <Grid size={6}>
                    <Stack gap={2}>
                    <TextField
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel id="salutation-label">Salutation</InputLabel>
                        <Select
                            labelId="salutation-label"
                            label="Salutation"
                            name="salutation"
                            value={formData.salutation}
                            onChange={handleSelectChange}
                            fullWidth
                        >
                            <MenuItem value="Dr">Dr</MenuItem>
                            <MenuItem value="Mr">Mr</MenuItem>
                            <MenuItem value="Mrs">Mrs</MenuItem>
                            <MenuItem value="Ms">Ms</MenuItem>
                            <MenuItem value="Mx">Mx</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Gender</FormLabel>
                        <RadioGroup
                            name="gender"
                            value={formData.gender}
                            onChange={handleRadioChange}
                            row
                        >
                            <FormControlLabel value="male" control={<Radio />} label="Male"/>
                            <FormControlLabel value="female" control={<Radio />} label="Female"/>
                            <FormControlLabel value="unspecified" control={<Radio />} label="Unspecified"/>
                        </RadioGroup>
                    </FormControl>
                    <TextField
                        label="Employee #"
                        name="employeeNumber"
                        value={formData.employeeNumber}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    </Stack>
                </Grid>

                <Grid size={6}>
                    <Stack gap={2}>
                    <TextField
                        label="Full Name"
                        name="fullName"
                        value={`${formData.firstName} ${formData.lastName}`}
                        disabled
                        fullWidth
                    />
                     <TextField
                        label="Gross Salary $PY"
                        name="grossSalary"
                        value={formData.grossSalary}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Profile Color</FormLabel>
                        <RadioGroup
                            name="profileColour"
                            value={formData.profileColour}
                            onChange={handleRadioChange}
                            row
                        >
                            <FormControlLabel value="green" control={<Radio />} label="Green"/>
                            <FormControlLabel value="blue" control={<Radio />} label="Blue"/>
                            <FormControlLabel value="red" control={<Radio />} label="Red"/>
                            <FormControlLabel value="none" control={<Radio />} label="Default"/>
                        </RadioGroup>
                    </FormControl>
                    </Stack>
                </Grid>
            </Grid>
        </form>
    </>)
});

export default EmployeeInfoForm;