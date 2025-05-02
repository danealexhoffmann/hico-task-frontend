
import { useState, useEffect } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormLabel, FormControlLabel, RadioGroup, Radio, Box, Button, Stack } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

type UpdateEmployeeFormProps = {
    employee: {
        id: number;
        first_name: string;
        last_name: string;
        salutation: 'Dr' | 'Mr' | 'Mrs' | 'Ms' | 'Mx';
        gender: 'male' | 'female' | 'unspecified';
        employee_number: number; 
        gross_salary: number;
        profile_colour: 'green' | 'blue' | 'red' | 'none';
    }
};

type ApiResponse = {
    message: string;
    employeeNumber: number;
    error?: string;
}


const UpdateEmployeeForm:React.FC<UpdateEmployeeFormProps> = ({ employee }: UpdateEmployeeFormProps ) => {

    console.log('employee', employee);
    const [formattedSalary, setFormattedSalary] = useState<string>('');

    const [formData, setFormData] = useState({
        firstName: employee.first_name,
        lastName: employee.last_name,
        salutation: employee.salutation,
        gender: employee.gender,
        employeeNumber: employee.employee_number,
        grossSalary: employee.gross_salary,
        profileColour: employee.profile_colour
    })

    useEffect(() => {
        if (employee) {
            setFormData({
                firstName: employee.first_name,
                lastName: employee.last_name,
                salutation: employee.salutation,
                gender: employee.gender,
                employeeNumber: employee.employee_number,
                grossSalary: employee.gross_salary,
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
    } else if (name === 'grossSalary') {
       const numOnlyValue = value.replace(/\D/g, ''); 


       setFormData(prev => ({
        ...prev,
        [name]: numOnlyValue ? parseFloat(numOnlyValue) : 0
       }))

       const formattedNumValue = numOnlyValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
       setFormattedSalary(formattedNumValue);
        
    } else {
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
        alert('Employee updated successfully');
        console.log('Employee updated successfully:', data);
        
    } catch (error) {
        console.error('Error adding employee:', error);
        alert('Failed to update employee. Please try again.');
    }
};

  const handleReset = () => {
    setFormData({
        firstName: employee.first_name,
        lastName: employee.last_name,
        salutation: employee.salutation,
        gender: employee.gender,
        employeeNumber: employee.employee_number,
        grossSalary: employee.gross_salary,
        profileColour: employee.profile_colour
    });
    setFormattedSalary('');
  }

    return (
    <>
        <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <p>Update Employee</p>
            <div>
            <Button onClick={handleReset}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: `${formData.profileColour}` }}
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
                        value={formattedSalary}
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
}

export default UpdateEmployeeForm;