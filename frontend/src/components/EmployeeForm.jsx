// frontend/src/components/EmployeeForm.jsx (Fix: Removed getDepartments definition)

import React, { useState, useEffect } from 'react';
// Import getDepartments along with others
import { createEmployee, updateEmployee, getDepartments } from '../services/api';

// --- MUI Imports ---
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Snackbar from '@mui/material/Snackbar';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

// --- Date Picker Imports ---
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// --- Choices ---
const EMPLOYMENT_TYPES = [ { value: 'Full-time', label: 'Full-time' }, { value: 'Part-time', label: 'Part-time' },{ value: 'Contract', label: 'Contract' }, { value: 'Intern', label: 'Intern' },];
const EMPLOYEE_STATUSES = [ { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'On Leave', label: 'On Leave' }, { value: 'Probation', label: 'Probation' }, ];
const GENDERS = [ { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }, { value: 'Prefer Not To Say', label: 'Prefer Not To Say' }, ];
const MARITAL_STATUSES = [ { value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }, { value: 'Other', label: 'Other' }, ];
const COUNTRIES = [ { code: 'IN', label: 'India' }, { code: 'US', label: 'United States' }, { code: 'GB', label: 'United Kingdom' }, /* ... add more ... */ ];

// --- Component Definition ---
function EmployeeForm({ onEmployeeCreated, onCancel, initialData = null, onEmployeeUpdated, isEditing = false }) {

  // State includes department_id now
  const initialFormState = {
    employee_id: '', user_id: '', mobile_phone: '', department_id: '', // Use department_id
    job_title: '', employment_type: 'Full-time', date_joined: null,
    employee_status: 'Probation', date_of_birth: null, gender: '', // Default selects to empty string
    marital_status: '', home_address: '', nationality: '', // Default selects to empty string
  };

  const [formData, setFormData] = useState(initialFormState);
  const [departments, setDepartments] = useState([]); // State for department list
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null); // Renamed for clarity
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  // Fetch departments when component mounts
  useEffect(() => {
    let isMounted = true;
    const loadDepartments = async () => {
        try {
            const deptData = await getDepartments();
            if (isMounted) {
                setDepartments(deptData || []);
            }
        } catch (err) {
            console.error("Failed to fetch departments:", err);
            if (isMounted) {
                setFormError("Could not load department list.");
            }
        }
    };
    loadDepartments();
    return () => { isMounted = false; }; // Cleanup
  }, []); // Empty dependency array, runs once

  // Effect to populate form when editing
  useEffect(() => {
    // Reset form fields and profile picture state when initialData changes or is null (for create)
    if (!isEditing) {
        setFormData(initialFormState);
        setProfilePictureFile(null);
        const fileInput = document.getElementById('profile-picture-upload');
        if (fileInput) fileInput.value = '';
    } else if (isEditing && initialData) {
        setFormData({
            employee_id: initialData.employee_id || '',
            user_id: initialData.user?.id ?? '',
            mobile_phone: initialData.mobile_phone ?? '',
            department_id: initialData.department?.id ?? '', // Set department_id from nested object
            job_title: initialData.job_title ?? '',
            employment_type: initialData.employment_type || 'Full-time',
            date_joined: initialData.date_joined ? dayjs(initialData.date_joined) : null,
            employee_status: initialData.employee_status || 'Probation',
            date_of_birth: initialData.date_of_birth ? dayjs(initialData.date_of_birth) : null,
            gender: initialData.gender ?? '',
            marital_status: initialData.marital_status ?? '',
            home_address: initialData.home_address ?? '',
            nationality: initialData.nationality ?? '',
        });
        setProfilePictureFile(null); // Reset selected file on edit start
        const fileInput = document.getElementById('profile-picture-upload');
        if (fileInput) fileInput.value = '';
    }
  }, [initialData, isEditing]); // Rerun when initialData or isEditing changes


  // Handlers
  const handleChange = (event) => { setFormData(prevState => ({ ...prevState, [event.target.name]: event.target.value })); };
  const handleDateChange = (newValue) => { setFormData(prevState => ({ ...prevState, date_joined: newValue })); };
  const handleDobChange = (newValue) => { setFormData(prevState => ({ ...prevState, date_of_birth: newValue })); };
  const handleFileChange = (event) => { setProfilePictureFile(event.target.files ? event.target.files[0] : null); };

  // handleSubmit
  const handleSubmit = async (event) => {
     event.preventDefault(); setLoading(true); setFormError(null);

     const formattedDateJoined = formData.date_joined ? dayjs(formData.date_joined).format('YYYY-MM-DD') : null;
     const formattedDob = formData.date_of_birth && dayjs(formData.date_of_birth).isValid() ? dayjs(formData.date_of_birth).format('YYYY-MM-DD') : null;
     const userIdInt = formData.user_id ? parseInt(formData.user_id, 10) : null;

     // --- Validation ---
     if (!formData.employee_id || !formattedDateJoined) { setFormError('Employee ID and Date Joined are required.'); setLoading(false); return; }
     if (formData.user_id && isNaN(userIdInt)) { setFormError('User ID must be a valid number.'); setLoading(false); return; }

     const dataToSend = new FormData();

     // Iterate over form state keys, format/append as needed
     Object.keys(formData).forEach(key => {
         let value = formData[key];
         if (key === 'date_joined') value = formattedDateJoined;
         else if (key === 'date_of_birth') value = formattedDob;
         else if (key === 'user_id') value = userIdInt;
         // Only append if value is not null/undefined/empty string
         // Exception: user_id CAN be null if sent explicitly, but we handle that below
         if (value !== null && value !== undefined && value !== '') {
             dataToSend.append(key, value); // This sends department_id correctly
         }
     });
     // Handle optional user link: if user_id is empty in form, don't send it
     // If backend needs explicit null to unlink user, handle that here
     if (userIdInt !== null) {
         // Re-append user_id if it was skipped above because it was 0
         // Or just ensure it's appended correctly based on previous logic
         // This assumes null is handled correctly by backend or not needed for optional OneToOne
         if (!dataToSend.has('user_id')) dataToSend.append('user_id', userIdInt);
     }


     if (profilePictureFile) { dataToSend.append('profile_picture', profilePictureFile); }

     console.log('--- Submitting Data ---'); /* Keep logs */
     console.log(`isEditing: ${isEditing}, ID: ${initialData?.id}`);
     console.log('FormData Entries:'); for (let pair of dataToSend.entries()) { console.log(`  ${pair[0]}: ${pair[1]}`); }

     try {
       if (isEditing && initialData?.id) {
         console.log('Calling updateEmployee API...');
         const updatedEmployee = await updateEmployee(initialData.id, dataToSend);
         console.log('updateEmployee API successful:', updatedEmployee);
         setSuccessMessage('Employee updated successfully!'); setSuccessOpen(true);
         if (onEmployeeUpdated) { console.log('Calling onEmployeeUpdated callback...'); onEmployeeUpdated(updatedEmployee); }
       } else {
         console.log('Calling createEmployee API...');
         const newEmployee = await createEmployee(dataToSend);
         console.log('createEmployee API successful:', newEmployee);
         setSuccessMessage('Employee created successfully!'); setSuccessOpen(true);
         if (onEmployeeCreated) { console.log('Calling onEmployeeCreated callback...'); onEmployeeCreated(newEmployee); }
       }
     } catch (err) { console.error(`Error during ${isEditing ? 'update' : 'create'}:`, err); setFormError(err.message || `Failed to ${isEditing ? 'update' : 'create'} employee.`); }
     finally { console.log('Setting loading false.'); setLoading(false); }
  };

  const handleCloseSnackbar = (event, reason) => { if (reason === 'clickaway') return; setSuccessOpen(false); };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ mt: 1, p: { xs: 2, md: 3 }, mb: 3 }} elevation={2}>
        <Typography component="h2" variant="h6" gutterBottom sx={{ mb: 2 }}>
          {isEditing ? `Edit Employee (ID: ${initialData?.employee_id})` : 'Create New Employee'}
        </Typography>
        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

        <Grid container spacing={2}> {/* Using spacing=2 */}

            {/* --- Job Information Group --- */}
            {/* Grid V2: Removed 'item' prop */}
            <Grid xs={12}><Divider sx={{ mt: 1, mb: 1.5 }} /></Grid>
            <Grid xs={12} sm={6}><TextField label="Employee ID" name="employee_id" value={formData.employee_id} onChange={handleChange} required fullWidth variant="outlined" disabled={loading || isEditing}/></Grid>
            <Grid xs={12} sm={6}><DatePicker label="Date Joined *" value={formData.date_joined} onChange={handleDateChange} format="YYYY-MM-DD" sx={{ width: '100%' }} slotProps={{ textField: { required: true, variant: "outlined" } }} disabled={loading}/></Grid>
            <Grid xs={12} sm={6}>
                {/* --- Department Dropdown --- */}
                <FormControl fullWidth variant="outlined" disabled={loading}>
                    <InputLabel id="department-label">Department</InputLabel>
                    <Select
                        labelId="department-label"
                        name="department_id" // Use department_id for state binding
                        value={formData.department_id ?? ''} // Bind to department_id state
                        label="Department"
                        onChange={handleChange} // Standard handleChange works
                        displayEmpty
                    >
                        <MenuItem value=""><em>Select Department...</em></MenuItem>
                        {departments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}> {/* Value is dept ID */}
                                {dept.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid xs={12} sm={6}><TextField label="Job Title" name="job_title" value={formData.job_title} onChange={handleChange} fullWidth variant="outlined" disabled={loading}/></Grid>
            <Grid xs={12} sm={6}><FormControl fullWidth required disabled={loading} variant="outlined"> <InputLabel>Employment Type</InputLabel> <Select name="employment_type" value={formData.employment_type ?? ''} label="Employment Type *" onChange={handleChange}>{EMPLOYMENT_TYPES.map((o)=><MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</Select> </FormControl> </Grid>
            <Grid xs={12} sm={6}><FormControl fullWidth required disabled={loading} variant="outlined"> <InputLabel>Employee Status</InputLabel> <Select name="employee_status" value={formData.employee_status ?? ''} label="Employee Status *" onChange={handleChange}>{EMPLOYEE_STATUSES.map((o)=><MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</Select> </FormControl> </Grid>

            {/* --- Divider --- */}
            <Grid xs={12}><Divider sx={{ my: 1.5 }} /></Grid>

            {/* --- Personal Details Group --- */}
            <Grid xs={12} sm={6}><DatePicker label="Date of Birth" value={formData.date_of_birth} onChange={handleDobChange} format="YYYY-MM-DD" sx={{ width: '100%' }} slotProps={{ textField: { variant: "outlined" } }} disabled={loading}/></Grid>
            <Grid xs={12} sm={6}>
                 <FormControl fullWidth disabled={loading} variant="outlined">
                     <InputLabel id="nationality-label">Nationality</InputLabel>
                     <Select labelId="nationality-label" value={formData.nationality ?? ''} name="nationality" label="Nationality" onChange={handleChange} displayEmpty>
                       <MenuItem value=""><em>Select Nationality...</em></MenuItem>
                       {COUNTRIES.map((option) => (<MenuItem key={option.code} value={option.label}>{option.label}</MenuItem>))}
                     </Select>
                 </FormControl>
             </Grid>
            <Grid xs={12} sm={6}>
                 <FormControl fullWidth disabled={loading} variant="outlined">
                     <InputLabel id="gender-label">Gender</InputLabel>
                     <Select labelId="gender-label" name="gender" value={formData.gender ?? ''} label="Gender" onChange={handleChange} displayEmpty>
                         <MenuItem value=""><em>Select Gender...</em></MenuItem>
                         {GENDERS.map((o)=><MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                     </Select>
                </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
                 <FormControl fullWidth disabled={loading} variant="outlined">
                     <InputLabel id="marital-status-label">Marital Status</InputLabel>
                     <Select labelId="marital-status-label" name="marital_status" value={formData.marital_status ?? ''} label="Marital Status" onChange={handleChange} displayEmpty>
                         <MenuItem value=""><em>Select Status...</em></MenuItem>
                         {MARITAL_STATUSES.map((o)=><MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                     </Select>
                </FormControl>
            </Grid>

              {/* --- Divider --- */}
             <Grid xs={12}><Divider sx={{ my: 1.5 }} /></Grid>

             {/* --- Contact Details Group --- */}
             <Grid xs={12} sm={6}><TextField label="Mobile Phone" name="mobile_phone" value={formData.mobile_phone} onChange={handleChange} fullWidth variant="outlined" disabled={loading}/></Grid>
             <Grid xs={12} sm={6}><TextField label="User ID Link (Optional)" name="user_id" type="number" value={formData.user_id ?? ''} onChange={handleChange} fullWidth variant="outlined" disabled={loading} helperText="For login access."/></Grid>
             <Grid xs={12}><TextField label="Home Address" name="home_address" value={formData.home_address} onChange={handleChange} fullWidth variant="outlined" multiline rows={3} disabled={loading}/> </Grid>

             {/* --- Divider --- */}
             <Grid xs={12}><Divider sx={{ my: 1.5 }} /></Grid>

             {/* --- Profile Picture Group --- */}
             <Grid xs={12}><Box sx={{ mt: 1, mb: 1 }}> <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} htmlFor="profile-picture-upload" disabled={loading}> Upload New Picture <input type="file" accept="image/*" hidden id="profile-picture-upload" onChange={handleFileChange}/> </Button> {profilePictureFile && ( <Typography variant="body2" sx={{ display: 'inline', ml: 2 }}>{profilePictureFile.name}</Typography> )} {isEditing && initialData?.profile_picture && !profilePictureFile && ( <Typography variant="body2" sx={{ display: 'block', mt: 1 }}> Current: <a href={initialData.profile_picture} target="_blank" rel="noopener noreferrer">{initialData.profile_picture.split('/').pop()}</a> </Typography> )} </Box></Grid>

        </Grid> {/* End Grid container */}

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
           <Button onClick={onCancel} disabled={loading} color="secondary">Cancel</Button>
           <Button type="submit" variant="contained" disabled={loading}> {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update Employee' : 'Create Employee')} </Button>
         </Box>

        <Snackbar open={successOpen} autoHideDuration={4000} onClose={handleCloseSnackbar}><Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>{successMessage}</Alert></Snackbar>

      </Paper>
    </LocalizationProvider>
  );
}

export default EmployeeForm;