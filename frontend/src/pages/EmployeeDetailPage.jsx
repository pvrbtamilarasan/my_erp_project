// frontend/src/pages/EmployeeDetailPage.jsx (Tabbed Layout - Final Corrected)

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback back
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEmployeeById, deleteEmployee } from '../services/api';

// --- MUI Imports ---
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person'; // Default icon
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import EditIcon from '@mui/icons-material/Edit'; // Import Edit Icon

// Import the form for Edit mode
import EmployeeForm from '../components/EmployeeForm';

// Helper component for Tab Panel content rendering
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && (
        // Add padding to the Box containing the tab content
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}> {/* Responsive Padding */}
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function to manage Tab Panel accessibility props
function a11yProps(index) {
  return {
    id: `employee-tab-${index}`,
    'aria-controls': `employee-tabpanel-${index}`,
  };
}

// --- Main Detail Page Component ---
function EmployeeDetailPage({ onLogout }) {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  // --- State ---
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [tabValue, setTabValue] = useState(0); // Default to first tab (Personal Info)
  const [isEditing, setIsEditing] = useState(false); // State for edit mode

  // --- Fetch Data ---
  const fetchEmployee = useCallback(async () => {
      if (!employeeId) { setError("Employee ID not found in URL."); setLoading(false); return; }
      // Reset state but keep employee data if available for smoother refresh feel
      setLoading(true); setError(null); setDeleteError(null);
      try {
        const data = await getEmployeeById(employeeId);
        setEmployee(data);
      } catch (err) {
        console.error("Error in detail fetch:", err);
        setError(err.message || 'Failed to load employee details.');
        if (err.response && (err.response.status === 401 || err.response.status === 403)) { setError('Authentication failed.'); }
        else if (err.message.includes("not found")) { setError(err.message); }
      } finally {
        setLoading(false);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]); // Depend only on employeeId

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]); // Run fetchEmployee when it changes (only when employeeId changes)


  // --- Handlers ---
  const handleDelete = async () => {
      if (!employeeId) return;
      if (window.confirm(`Are you sure you want to delete employee ${employee?.employee_id || employeeId}?`)) {
         setDeleteError(null);
         try {
            await deleteEmployee(employeeId);
            alert('Employee deleted successfully.');
            navigate('/employees');
         } catch (err) { setDeleteError(err.message || 'Failed to delete.'); }
      }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handlers for Edit Mode
  const handleEditClick = () => { setIsEditing(true); };
  const handleCancelEdit = () => { setIsEditing(false); };
  const handleUpdateComplete = (updatedEmployee) => {
    setIsEditing(false);
    fetchEmployee(); // Re-fetch data after update
    // Consider showing a success snackbar here instead of alert in form
  };

  // --- Render Logic ---

  // 1. Loading check (only show full page spinner if employee is null)
  if (loading && !employee) { return ( <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}> <CircularProgress /> </Container> ); }

  // 2. Error check
  if (error) { return ( <Container sx={{ mt: 3 }}> <Alert severity="error">{error}</Alert> <Button component={Link} to="/employees" variant="outlined" sx={{mt: 2}}>Back to List</Button> {onLogout && <Button variant="outlined" color="secondary" sx={{mt: 2, ml: 1}} onClick={onLogout}>Log Out</Button> } </Container> ); }

  // 3. Null employee check (redundant if loading check is correct, but safe)
  if (!employee) { return ( <Container sx={{ mt: 3 }}> <Alert severity="warning">Employee data not found.</Alert> <Button component={Link} to="/employees" variant="outlined" sx={{mt: 2}}>Back to List</Button> </Container> ); }

  // --- Main Detail Page Render ---
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Employee Profile
      </Typography>

      {deleteError && ( <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}> Delete Error: {deleteError} </Alert> )}

      {/* Top Header Section */}
       <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar
              alt={`${employee.user?.first_name || ''} ${employee.user?.last_name || ''}`}
              src={employee.profile_picture || undefined}
              sx={{ width: 120, height: 120 }} // Photo size
          > {!employee.profile_picture && <PersonIcon sx={{width:'60%', height:'60%'}}/>} </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="div"> {`${employee.user?.first_name || ''} ${employee.user?.last_name || ''}`.trim() || 'Name Not Set'} </Typography>
            <Typography variant="body1" color="text.secondary"> {employee.job_title || 'No Job Title'} </Typography>
             <Typography variant="caption" color="text.secondary"> Employee ID: {employee.employee_id} </Typography>
          </Box>
           <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, alignItems: 'center' }}> {/* Header Buttons */}
                 {!isEditing && ( // Show Edit only if NOT editing
                    <Button variant="contained" color="primary" size="small" startIcon={<EditIcon/>} onClick={handleEditClick}> Edit Employee </Button>
                 )}
                 <Button component={Link} to="/employees" variant="outlined" size="small">Back to List</Button>
                 {onLogout && <Button variant="outlined" color="secondary" size="small" onClick={onLogout}>Log Out</Button>}
           </Box>
       </Paper>

      {/* Conditionally Render Form or Tabs */}
      {isEditing ? (
            <EmployeeForm
              initialData={employee}
              onEmployeeUpdated={handleUpdateComplete}
              onCancel={handleCancelEdit}
              isEditing={true}
            />
        ) : (
            <Box sx={{ width: '100%' }}>
               {/* Tabs Navigation */}
               <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="employee detail tabs" variant="scrollable" scrollButtons="auto">
                        <Tab label="Personal Info" {...a11yProps(0)} />
                        <Tab label="Contact" {...a11yProps(1)} />
                        <Tab label="Employment Details" {...a11yProps(2)} />
                        {/* Add more tabs here */}
                    </Tabs>
               </Box>

               {/* Tab Content Panels */}
               <TabPanel value={tabValue} index={0}>
                   <Paper elevation={0} sx={{p: {xs: 1, sm: 2}}}>
                       <Typography variant="h6" gutterBottom>Personal Information</Typography>
                       <Divider sx={{ mb: 2 }}/>
                       <Stack spacing={1.25}>
                           <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Full Name</Box>: <Box component="span" sx={{ pl: 1 }}>{`${employee.user?.first_name || ''} ${employee.user?.last_name || ''}`.trim() || 'N/A'}</Box> </Typography>
                           <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Date of Birth</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.date_of_birth || 'N/A'}</Box> </Typography>
                           <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Gender</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.gender || 'N/A'}</Box> </Typography>
                           <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Marital Status</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.marital_status || 'N/A'}</Box> </Typography>
                           <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Nationality</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.nationality || 'N/A'}</Box> </Typography>
                           <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline', wordBreak: 'break-word' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Home Address</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.home_address || 'N/A'}</Box> </Typography>
                       </Stack>
                   </Paper>
               </TabPanel>

               <TabPanel value={tabValue} index={1}>
                    <Paper elevation={0} sx={{p: {xs: 1, sm: 2}}}>
                       <Typography variant="h6" gutterBottom>Contact Information</Typography>
                       <Divider sx={{ mb: 2 }}/>
                       <Stack spacing={1.25}>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Username</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.user?.username || 'N/A'}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline', wordBreak: 'break-word' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Work Email</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.user?.email || 'N/A'}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Mobile Phone</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.mobile_phone || 'N/A'}</Box> </Typography>
                       </Stack>
                   </Paper>
               </TabPanel>

               <TabPanel value={tabValue} index={2}>
                    <Paper elevation={0} sx={{p: {xs: 1, sm: 2}}}>
                       <Typography variant="h6" gutterBottom>Employment Details</Typography>
                       <Divider sx={{ mb: 2 }}/>
                       <Stack spacing={1.25}>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Employee ID</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.employee_id}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Department</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.department?.name || 'N/A'}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Job Title</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.job_title || 'N/A'}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Employment Type</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.employment_type}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Status</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.employee_status}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 }}>Date Joined</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.date_joined}</Box> </Typography>
                           <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 'bold', width: '160px', flexShrink: 0, pr: 1 }}>Record Created</Box>: <Box component="span" sx={{ pl: 1 }}>{new Date(employee.date_created).toLocaleString()}</Box> </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ fontWeight: 'bold', width: '160px', flexShrink: 0, pr: 1 }}>Last Updated</Box>: <Box component="span" sx={{ pl: 1 }}>{new Date(employee.date_updated).toLocaleString()}</Box> </Typography>
                       </Stack>
                   </Paper>
               </TabPanel>
               {/* --- End Tab Panels --- */}
           </Box> // End Box wrapping Tabs and Panels
       ) // End Conditional Rendering
      }

      {/* --- Action Buttons (Bottom, Aligned) --- */}
       <Box sx={{ mt: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
          {!isEditing && ( // Show Delete only when viewing details
            <Button variant="contained" color="error" onClick={handleDelete}> Delete Employee </Button>
          )}
          {/* Edit Button moved to header */}
          {/* Back to List button moved to header */}
          {/* Logout button moved to header / will be in App layout */}
       </Box>

    </Container>
  );
}

export default EmployeeDetailPage;