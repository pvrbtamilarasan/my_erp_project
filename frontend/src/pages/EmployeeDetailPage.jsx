// frontend/src/pages/EmployeeDetailPage.jsx (Fixed sx props in Tab Panels - FINAL v2)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEmployeeById, deleteEmployee } from '../services/api';
import EmployeeForm from '../components/EmployeeForm';

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
import PersonIcon from '@mui/icons-material/Person';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';

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
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}> {/* Padding inside tab panel */}
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
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  // --- Fetch Data ---
  const fetchEmployee = useCallback(async () => {
      if (!employeeId) { setError("Employee ID not found in URL."); setLoading(false); return; }
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
  }, [employeeId]);

  useEffect(() => { fetchEmployee(); }, [fetchEmployee]);

  // --- Handlers ---
  const handleDelete = async () => {
       if (!employeeId) return;
       if (window.confirm(`Are you sure you want to delete employee ${employee?.employee_id || employeeId}?`)) {
          setDeleteError(null);
          try { await deleteEmployee(employeeId); alert('Employee deleted successfully.'); navigate('/employees'); }
          catch (err) { setDeleteError(err.message || 'Failed to delete.'); }
       }
   };
  const handleTabChange = (event, newValue) => { setTabValue(newValue); };
  const handleEditClick = () => { setIsEditing(true); };
  const handleCancelEdit = () => { setIsEditing(false); };
  const handleUpdateComplete = (updatedEmployee) => { setIsEditing(false); fetchEmployee(); };
  const handlePhotoClick = () => { if (employee?.profile_picture) { setPhotoModalOpen(true); } };
  const handlePhotoModalClose = () => { setPhotoModalOpen(false); };


  // --- Render Logic ---
  if (loading && !employee) { return ( <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container> ); }
  if (error) { return ( <Container sx={{ mt: 3 }}><Alert severity="error">{error}</Alert><Button component={Link} to="/employees" variant="outlined" sx={{mt: 2}}>Back</Button>{onLogout && <Button variant="outlined" color="secondary" sx={{mt: 2, ml: 1}} onClick={onLogout}>Logout</Button> }</Container> ); }
  if (!employee) { return ( <Container sx={{ mt: 3 }}><Alert severity="warning">Employee data not found.</Alert><Button component={Link} to="/employees" variant="outlined" sx={{mt: 2}}>Back</Button></Container> ); }

  // Define label style once
  const labelStyle = { fontWeight: 500, width: '160px', flexShrink: 0, color: 'text.secondary', pr: 1 };

  // --- Main Detail Page Render ---
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom> Employee Profile </Typography>
      {deleteError && ( <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}> Delete Error: {deleteError} </Alert> )}

      {/* Top Header Section */}
       <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box onClick={handlePhotoClick} sx={{ cursor: employee.profile_picture ? 'pointer' : 'default' }} title={employee.profile_picture ? 'Click to enlarge photo' : ''}>
              <Avatar src={employee.profile_picture || undefined} sx={{ width: 120, height: 120 }} > {!employee.profile_picture && <PersonIcon sx={{width:'60%', height:'60%'}}/>} </Avatar>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5"> {`${employee.user?.first_name || ''} ${employee.user?.last_name || ''}`.trim() || 'Name Not Set'} </Typography>
            <Typography variant="body1" color="text.secondary"> {employee.job_title || 'No Job Title'} </Typography>
             <Typography variant="caption" color="text.secondary"> Employee ID: {employee.employee_id} </Typography>
          </Box>
           <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, alignItems: 'center' }}> {/* Header Buttons */}
                 {!isEditing && ( <Button variant="contained" color="primary" size="small" startIcon={<EditIcon/>} onClick={handleEditClick}> Edit Employee </Button> )}
                 <Button component={Link} to="/employees" variant="outlined" size="small">Back to List</Button>
                 {onLogout && <Button variant="outlined" color="secondary" size="small" onClick={onLogout}>Log Out</Button>}
           </Box>
       </Paper>

      {/* Conditionally Render Form or Tabs */}
      {isEditing ? (
            <EmployeeForm initialData={employee} onEmployeeUpdated={handleUpdateComplete} onCancel={handleCancelEdit} isEditing={true}/>
        ) : (
            <Box sx={{ width: '100%' }}>
               {/* Tabs Navigation */}
               <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="employee detail tabs" variant="scrollable" scrollButtons="auto">
                        <Tab label="Personal Info" {...a11yProps(0)} />
                        <Tab label="Contact" {...a11yProps(1)} />
                        <Tab label="Job & Position" {...a11yProps(2)} />
                        <Tab label="Status & System" {...a11yProps(3)} />
                    </Tabs>
               </Box>

               {/* --- Tab Content Panels --- */}
               {/* Panel 0: Personal Info - with correct sx */}
               <TabPanel value={tabValue} index={0}>
                   <Paper elevation={0} sx={{p: {xs: 1, sm: 2}}}>
                       <Typography variant="h6" gutterBottom>Personal Information</Typography><Divider sx={{ mb: 2 }}/>
                       <Stack spacing={1.25}>
                           {/* Applied labelStyle */}
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Full Name</Box>: <Box component="span" sx={{ pl: 1 }}>{`${employee.user?.first_name || ''} ${employee.user?.last_name || ''}`.trim() || 'N/A'}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Date of Birth</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.date_of_birth || 'N/A'}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Gender</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.gender || 'N/A'}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Marital Status</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.marital_status || 'N/A'}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Nationality</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.nationality || 'N/A'}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline', wordBreak: 'break-word' }}> <Box component="span" sx={labelStyle}>Home Address</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.home_address || 'N/A'}</Box> </Typography>
                       </Stack>
                   </Paper>
               </TabPanel>

                {/* Panel 1: Contact - with correct sx */}
               <TabPanel value={tabValue} index={1}>
                    <Paper elevation={0} sx={{p: {xs: 1, sm: 2}}}>
                       <Typography variant="h6" gutterBottom>Contact Information</Typography><Divider sx={{ mb: 2 }}/>
                       <Stack spacing={1.25}>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Username</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.user?.username || 'N/A'}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline', wordBreak: 'break-word' }}> <Box component="span" sx={labelStyle}>Work Email</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.user?.email || 'N/A'}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Mobile Phone</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.mobile_phone || 'N/A'}</Box> </Typography>
                       </Stack>
                   </Paper>
               </TabPanel>

               {/* Panel 2: Job & Position - with correct sx */}
               <TabPanel value={tabValue} index={2}>
                    <Paper elevation={0} sx={{p: {xs: 1, sm: 2}}}>
                       <Typography variant="h6" gutterBottom>Job & Position</Typography><Divider sx={{ mb: 2 }}/>
                       <Stack spacing={1.25}>
                             <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Employee ID</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.employee_id}</Box> </Typography>
                             <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Department</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.department?.name || 'N/A'}</Box> </Typography>
                             <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Job Title</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.job_title || 'N/A'}</Box> </Typography>
                             <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Employment Type</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.employment_type}</Box> </Typography>
                       </Stack>
                   </Paper>
               </TabPanel>

               {/* Panel 3: Status & System - with correct sx */}
               <TabPanel value={tabValue} index={3}>
                    <Paper elevation={0} sx={{p: {xs: 1, sm: 2}}}>
                       <Typography variant="h6" gutterBottom>Status & System Information</Typography><Divider sx={{ mb: 2 }}/>
                       <Stack spacing={1.25}>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Status</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.employee_status}</Box> </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={labelStyle}>Date Joined</Box>: <Box component="span" sx={{ pl: 1 }}>{employee.date_joined}</Box> </Typography>
                           <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ ...labelStyle, fontWeight: 'bold' }}>Record Created</Box>: <Box component="span" sx={{ pl: 1 }}>{new Date(employee.date_created).toLocaleString()}</Box> </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'baseline' }}> <Box component="span" sx={{ ...labelStyle, fontWeight: 'bold' }}>Last Updated</Box>: <Box component="span" sx={{ pl: 1 }}>{new Date(employee.date_updated).toLocaleString()}</Box> </Typography>
                       </Stack>
                   </Paper>
               </TabPanel>
           </Box> // End Tabs Box
       ) // End Conditional Rendering
      }

      {/* Action Buttons Below */}
       <Box sx={{ mt: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
          {!isEditing && ( <Button variant="contained" color="error" onClick={handleDelete}> Delete Employee </Button> )}
       </Box>

       {/* Photo Modal */}
       <Modal open={photoModalOpen} onClose={handlePhotoModalClose} aria-labelledby="profile-photo-modal-title">
           <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '90vw', maxHeight: '90vh', bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 1, outline: 'none' }}>
               <IconButton aria-label="close" onClick={handlePhotoModalClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500], backgroundColor: 'rgba(255, 255, 255, 0.7)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)', }, }} > <CloseIcon /> </IconButton>
               {employee?.profile_picture && ( <img src={employee.profile_picture} alt="Employee Profile Large" style={{ display: 'block', maxWidth: '100%', maxHeight: 'calc(90vh - 16px)', objectFit: 'contain' }} /> )}
           </Box>
       </Modal>

    </Container>
  );
}

export default EmployeeDetailPage;