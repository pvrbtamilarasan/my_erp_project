// frontend/src/pages/EmployeeListPage.jsx (Corrected List Page Code with Edit Trigger)

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
// Import API functions used here
import { getEmployees, deleteEmployee } from '../services/api'; // Adjust path if needed
// Import the form component
import EmployeeForm from '../components/EmployeeForm'; // Adjust path if needed

// --- MUI Imports ---
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
import VisibilityIcon from '@mui/icons-material/Visibility'; // View Icon
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';

// --- Employee List Page Component ---
function EmployeeListPage({ onLogout }) {
  // --- State Variables ---
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false); // For CREATE form visibility
  const [deleteError, setDeleteError] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null); // Holds employee data for EDIT form

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

  // Fetch employees when the component first mounts
  useEffect(() => {
    fetchEmployees();
  }, []); // Empty dependency array ensures it runs only once on mount

  // --- Event Handlers ---
  // Called by EmployeeForm after successful creation
  const handleEmployeeCreated = (newEmployee) => {
      console.log('handleEmployeeCreated called in ListPage');
      setShowCreateForm(false); // Hide create form
      fetchEmployees();         // Refresh the employee list
  };

  // Called by EmployeeForm after successful update
  const handleEmployeeUpdated = (updatedEmployee) => {
      console.log('handleEmployeeUpdated called in ListPage');
      setEditingEmployee(null); // Hide edit form
      fetchEmployees();         // Refresh the employee list
  };

  // Called when Edit button in table row is clicked
  const handleEditClick = (employee) => {
    console.log('Edit clicked for employee:', employee);
    setEditingEmployee(employee); // Set the employee object to edit state
    setShowCreateForm(false);     // Ensure create mode is off
  };

  // Called when Cancel button in EmployeeForm is clicked
  const handleCancelForm = () => {
      console.log('Cancel form called');
      setShowCreateForm(false);
      setEditingEmployee(null);
  };

  // Called when Delete button in table row is clicked
  const handleDeleteClick = async (employeeId, employeeIdentifier) => {
     if (window.confirm(`Are you sure you want to delete employee ${employeeIdentifier}?`)) {
        setDeleteError(null);
        try { await deleteEmployee(employeeId); fetchEmployees(); }
        catch (err) { setDeleteError(err.message || 'Failed to delete.'); console.error(err); }
     }
  };

  // Called when View button in table row is clicked
  const handleViewClick = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  // Called when Add Employee button is clicked
  const handleAddClick = () => {
    console.log('Add Employee button clicked!'); // Keep this log for now
    setShowCreateForm(true); // Show form for creation
    setEditingEmployee(null); // Ensure not in edit mode
  };


  // --- Render Logic ---
  if (loading) { return ( <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container> ); }
  if (error) { return ( <Container sx={{ mt: 3 }}><Alert severity="error">{error}</Alert><Button sx={{mt: 1}} onClick={fetchEmployees}>Retry</Button>{onLogout && <Button sx={{mt: 1, ml: 1}} color="secondary" onClick={onLogout}>Logout</Button>}</Container> ); }

  // Determine if Create or Edit form should be visible
  const isFormVisible = showCreateForm || !!editingEmployee;
  console.log('Rendering EmployeeListPage. isFormVisible:', isFormVisible, 'showCreateForm:', showCreateForm, 'editingEmployee:', !!editingEmployee);

  return (
     <Container maxWidth="lg" style={{ marginTop: '20px' }}>
       {/* Header Section */}
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
         <Typography variant="h4" component="h1"> Employee Management </Typography>
         <Box>
            {/* Show Add button only if no form is visible */}
            {!isFormVisible && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} >
                  Add Employee
              </Button>
            )}
             <Button variant="contained" color="secondary" sx={{ml: 2}} onClick={onLogout}> Log Out </Button>
         </Box>
       </Box>

       {/* Delete Error Alert */}
       {deleteError && ( <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}> Delete Error: {deleteError} </Alert> )}

       {/* Conditionally render the EmployeeForm for Create OR Edit */}
       {isFormVisible && (
        <>
          {console.log('Rendering EmployeeForm because isFormVisible is true. Editing Employee:', editingEmployee)}
          <EmployeeForm
             // Add key to force re-mount/reset when switching between create/edit or different edits
             key={editingEmployee ? `edit-${editingEmployee.id}` : 'create'}
             initialData={editingEmployee} // Pass data if editing, null if creating
             onEmployeeCreated={handleEmployeeCreated} // Callback for successful creation
             onEmployeeUpdated={handleEmployeeUpdated} // Callback for successful update
             onCancel={handleCancelForm} // Callback for cancel button
             isEditing={!!editingEmployee} // Explicitly pass editing flag
           />
        </>
       )}

       {/* Show table only if no form is visible */}
       {!isFormVisible && (
         <>
          {console.log('Rendering Employee Table because isFormVisible is false.')}
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
                     <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
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
                       <TableCell>{employee.department || '-'}</TableCell>
                       <TableCell>{employee.employee_status}</TableCell>
                       <TableCell align="center" sx={{whiteSpace: 'nowrap'}}>
                         {/* View Button - Navigates to Detail Page */}
                         <IconButton size="small" color="info" onClick={() => handleViewClick(employee.id)} title="View Details"> <VisibilityIcon fontSize="small" /> </IconButton>
                         {/* Edit Button - Shows Form Inline */}
                         <IconButton size="small" color="primary" onClick={() => handleEditClick(employee)} title="Edit Inline"> <EditIcon fontSize="small" /> </IconButton>
                         {/* Delete Button */}
                         <IconButton size="small" color="error" onClick={() => handleDeleteClick(employee.id, employee.employee_id)} title="Delete"> <DeleteIcon fontSize="small" /> </IconButton>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </TableContainer>
           )
          }
         </> // End Fragment for table section
       )}
     </Container>
  );
}

export default EmployeeListPage;