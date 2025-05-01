import { useState } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormLabel, FormControlLabel, RadioGroup, Radio, Box, Button } from '@mui/material';

type FormData = {
    firstName: string;
    lastName: string;
    salutation: string;
    gender: string;
    employeeNumber: number; 
    grossSalary: number;
    profileColour: string;
};

const AddEmployeeForm:React.FC = () => {

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        salutation: 'Mx',
        gender: 'unspecified',
        employeeNumber: 0,
        grossSalary: 0,
        profileColour: 'none'
    })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      subscription: e.target.value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleReset = () => {
    setFormData({
        firstName: '',
        lastName: '',
        salutation: '',
        gender: 'unspecified',
        employeeNumber: 0,
        grossSalary: 0,
        profileColour: 'none'
    })
  }

    return (
    <>
       
        <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <p>Add Employee</p>
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
            <Grid container spacing={2} >
                <Grid size={6}>
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
                            name="salutation"
                            value={formData.salutation}
                            onChange={handleSelectChange}
                            fullWidth
                        >
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
                </Grid>

                <Grid size={6}>
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
                </Grid>
            </Grid>
        </form>
    </>)
}

export default AddEmployeeForm;