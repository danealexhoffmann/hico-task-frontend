import { useState, useEffect, useRef } from 'react';
import EmployeeInfoForm, { EmployeeInfoFormHandle } from './EmployeeInfoForm';
import { styled } from '@mui/material';
import { Container, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Box, Button, Typography, Stack } from '@mui/material';

type ApiResponse = {
  message: string;
}

const StyledTableHead = styled(TableHead)({
  backgroundColor: '#f5f5f5',
});

const getDisplayColor = (dbColor: string): string => {
  const colorMap: Record<string, string> = {
    'red': '#ffcccc',
    'green': '#ccffcc',
    'blue': '#ccccff',
  };

  return colorMap[dbColor] || dbColor;
};

export default function EmployeeTable() {

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const formRef = useRef<EmployeeInfoFormHandle>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/employees');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        console.log(result);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occured');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [refresh])

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const refreshTable = () => {
    setRefresh(prev => !prev);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null); // Clear any selected employee
    formRef.current?.submitForm(); // Call the form's submit method
  };

  return (
    <Container sx={{ display:'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Typography variant='subtitle2'>Current Employees</Typography>
        <Button variant='contained' onClick={handleAddEmployee}>add employee</Button>
      </Box>
      <TableContainer>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell>Employee #</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Salutation</TableCell>
              <TableCell>Profile Colour</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {data?.message.map(item =>
              <TableRow onClick={() => setSelectedEmployee(item)} key={item.id} sx={{ backgroundColor: getDisplayColor(item.profile_colour), cursor: 'pointer' }}>
                <TableCell>{item.employee_number}</TableCell>
                <TableCell>{item.first_name}</TableCell>
                <TableCell>{item.last_name}</TableCell>
                <TableCell>{item.salutation}</TableCell>
                <TableCell>{item.profile_colour}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </div>
           <Box sx={{ border: '1px solid #e5e5e5', padding: '20px', borderRadius: '8px' }}>
           <Stack gap={2}>
           <EmployeeInfoForm ref={formRef} employee={selectedEmployee} onSuccess={refreshTable} />
           </Stack>
         </Box>
    </Container>
  )
}