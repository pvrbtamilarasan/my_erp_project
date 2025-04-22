// frontend/src/pages/EmployeeListPage.jsx (Fix Department display & Check Structure)

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../services/api';
import EmployeeForm from '../components/EmployeeForm';

// MUI Imports
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';

function EmployeeListPage({ onLogout }) {
  // --- State Variables ---
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const navigate = useNavigate();

  // --- Data Fetching ---
  const fetchEmployees = async () => {
    setLoading(true); setError(null); setDeleteError(null);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) { setError('Failed to fetch employees.'); console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  // --- Event Handlers ---
  const handleEmployeeCreated = (newEmployee) => { setShowCreateForm(false); fetchEmployees(); };
  const handleEmployeeUpdated = (updatedEmployee) => { setEditingEmployee(null); fetchEmployees(); };
  const handleEditClick = (employee) => { setEditingEmployee(employee); setShowCreateForm(false); };
  const handleCancelForm = () => { setShowCreateForm(false); setEditingEmployee(null); };
  const handleDeleteClick = async (employeeId, employeeIdentifier) => {
     if (window.confirm(`Are you sure you want to delete employee ${employeeIdentifier}?`)) {
        setDeleteError(null);
        try { await deleteEmployee(employeeId); fetchEmployees(); }
        catch (err) { setDeleteError(err.message || 'Failed to delete.'); }
     }
  };
  const handleViewClick = (employeeId) => { navigate(`/employees/${employeeId}`); };
  const handleAddClick = () => { setShowCreateForm(true); setEditingEmployee(null); };

  // --- Render Logic ---
  if (loading) { return ( <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container> ); }
  if (error) { return ( <Container sx={{ mt: 3 }}><Alert severity="error">{error}</Alert><Button sx={{mt: 1}} onClick={fetchEmployees}>Retry</Button>{onLogout && <Button sx={{mt: 1, ml: 1}} color="secondary" onClick={onLogout}>Logout</Button>}</Container> ); }

  const isFormVisible = showCreateForm || !!editingEmployee;

  return (
     <Container maxWidth="lg" style={{ marginTop: '20px' }}>
       {/* Header Section */}
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
         <Typography variant="h4" component="h1"> Employee Management </Typography>
         <Box>
            {!isFormVisible && ( <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} > Add Employee </Button> )}
             <Button variant="contained" color="secondary" sx={{ml: 2}} onClick={onLogout}> Log Out </Button>
         </Box>
       </Box>

       {deleteError && ( <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}> Delete Error: {deleteError} </Alert> )}

       {/* Conditional Form Rendering */}
       {isFormVisible && (
          <EmployeeForm
             key={editingEmployee ? `edit-${editingEmployee.id}` : 'create'}
             initialData={editingEmployee}
             onEmployeeCreated={handleEmployeeCreated}
             onEmployeeUpdated={handleEmployeeUpdated}
             onCancel={handleCancelForm}
             isEditing={!!editingEmployee}
           />
       )}

       {/* Conditional Table Rendering */}
       {!isFormVisible && (
         <>
          {employees.length === 0 ? (
             <Typography sx={{mt: 4, textAlign: 'center'}}>No employees found.</Typography>
           ) : (
            <TableContainer component={Paper} elevation={3} sx={{mt: 3}}>
               <Table sx={{ minWidth: 650 }} size="small" aria-label="employee table">
                 <TableHead>
                   <TableRow>
                     <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                     <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                     <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                     <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                     <TableCell sx={{ fontWeight: 'bold' }}>Job Title</TableCell>
                     <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>{/* Keep Header */}
                     <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                     <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {employees.map((employee) => (
                     <TableRow key={employee.id} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.04)} }}>
                       <TableCell>{employee.employee_id}</TableCell>
                       <TableCell>{`${employee.user?.first_name || ''} ${employee.user?.last_name || ''}`.trim() || '-'}</TableCell>
                       <TableCell>{employee.user?.username || '-'}</TableCell>
                       <TableCell>{employee.user?.email || '-'}</TableCell>
                       <TableCell>{employee.job_title || '-'}</TableCell>
                       {/* --- CORRECTED Department Cell --- */}
                       <TableCell>{employee.department?.name || '-'}</TableCell>
                       {/* ---------------------------------- */}
                       <TableCell>{employee.employee_status || '-'}</TableCell> {/* Added fallback */}
                       <TableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                         <IconButton size="small" color="info" onClick={() => handleViewClick(employee.id)} title="View Details"> <VisibilityIcon fontSize="small" /> </IconButton>
                         <IconButton size="small" color="primary" onClick={() => handleEditClick(employee)} title="Edit Inline"> <EditIcon fontSize="small" /> </IconButton>
                         <IconButton size="small" color="error" onClick={() => handleDeleteClick(employee.id, employee.employee_id)} title="Delete"> <DeleteIcon fontSize="small" /> </IconButton>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </TableContainer>
           )
          }
         </>
       )}
     </Container>
  );
}

export default EmployeeListPage;