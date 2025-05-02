import { useState, useEffect } from 'react';
import AddEmployeeForm from './AddEmployeeForm';
import UpdateEmployeeForm from './UpdateEmployeeForm';
import { styled } from '@mui/material';
import { Container, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Box, Button } from '@mui/material';

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
  
  return colorMap[dbColor.toLowerCase()] || dbColor;
};

export default function EmployeeTable() {

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState<boolean>(false);
  const [showUpdateEmployeeForm, setShowUpdateEmployeeForm] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

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
  }, [])

  const handleEmployeeFormDisplay = (formToDisplay: string, employee: any) => {
    if (formToDisplay === 'add') {
      setShowAddEmployeeForm(true);
      setShowUpdateEmployeeForm(false);
    } else if (formToDisplay === 'update' && employee) {
      setShowUpdateEmployeeForm(true);
      setShowAddEmployeeForm(false);

      setSelectedEmployee(employee);
    }
  } 

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container sx={{ display:'flex', flexDirection: 'column', gap: '100px' }}>
      <div>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <p>Current Employees</p>
        <Button onClick={() => handleEmployeeFormDisplay('add', null)}>add employee</Button>
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
              <TableRow onClick={() => handleEmployeeFormDisplay('update', item)} key={item.id} sx={{ backgroundColor: getDisplayColor(item.profile_colour), cursor: 'pointer' }}>
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
      {showAddEmployeeForm && (
        <Box sx={{ border: '1px solid #e5e5e5', padding: '20px', borderRadius: '8px' }}>
          <AddEmployeeForm />
          <Button onClick={() => setShowAddEmployeeForm(false)}>Close</Button>
        </Box>
      )}
      {showUpdateEmployeeForm && (
        <Box sx={{ border: '1px solid #e5e5e5', padding: '20px', borderRadius: '8px' }}>
          <UpdateEmployeeForm employee={selectedEmployee} />
          <Button onClick={() => setShowUpdateEmployeeForm(false)}>Close</Button>
        </Box>
      )}
    </Container>
  )
}