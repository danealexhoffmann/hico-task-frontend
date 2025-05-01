import { useState, useEffect } from 'react';
import { styled } from '@mui/material';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

type ApiResponse = {
  message: string;
}

const StyledTableHead = styled(TableHead)({
  backgroundColor: '#f5f5f5',
});

export default function EmployeeTable() {

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <p>Current Employees</p>
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
            {data.message.map(item =>
              <TableRow key={item.id} sx={{ backgroundColor: item.profile_colour }}>
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
    </>
  )
}

