// frontend/src/components/EmployeeForm.jsx

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback import
// Assuming these services exist and work as expected
import { createEmployee, updateEmployee, getDepartments } from '../services/api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection after creation

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
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton'; // <-- ADDED THIS IMPORT

// --- Icon Imports ---
import CloseIcon from '@mui/icons-material/Close';

// --- Date Picker Imports ---
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// --- Choices (Make sure these are complete) ---
const EMPLOYMENT_TYPES = [ { value: 'Full-time', label: 'Full-time' }, { value: 'Part-time', label: 'Part-time' },{ value: 'Contract', label: 'Contract' }, { value: 'Intern', label: 'Intern' },];
const EMPLOYEE_STATUSES = [ { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'On Leave', label: 'On Leave' }, { value: 'Probation', label: 'Probation' }, ];
const GENDERS = [ { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }, { value: 'Prefer Not To Say', label: 'Prefer Not To Say' }, ];
const MARITAL_STATUSES = [ { value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }, { value: 'Other', label: 'Other' }, ];
const COUNTRIES = [ { code: 'IN', label: 'India' }, { code: 'US', label: 'United States' }, { code: 'GB', label: 'United Kingdom' }, /* ... add more countries ... */ ];

// --- Component Definition ---
// isEditing: boolean indicating if we are editing or creating
// initialData: object containing existing employee data if editing
// onEmployeeCreated: function to call on successful creation, receives new employee data
// onEmployeeUpdated: function to call on successful update, receives updated employee data
// onCancel: function to call when the cancel button is clicked
function EmployeeForm({ onEmployeeCreated, onCancel, initialData = null, onEmployeeUpdated, isEditing = false }) {

  const navigate = useNavigate(); // Hook for navigation

  // Initialize with empty strings for Select fields and null for Dates
  const initialFormState = {
    employee_id: '', user_id: '', mobile_phone: '', department_id: '',
    job_title: '', employment_type: 'Full-time', date_joined: null, // Use null for dates
    employee_status: 'Probation', date_of_birth: null, gender: '', // Use '' for selects
    marital_status: '', home_address: '', nationality: '', // Use '' for selects
    // Don't include profile_picture in initial state unless handling default display
    // profile_picture: '' // If you need to display the current picture URL
  };

  const [formData, setFormData] = useState(initialFormState);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null); // For API/form submission errors
  const [successOpen, setSuccessOpen] = useState(false); // For success Snackbar
  const [successMessage, setSuccessMessage] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null); // To hold the selected file
  const [profilePicturePreview, setProfilePicturePreview] = useState(null); // To hold the preview URL
  const [validationErrors, setValidationErrors] = useState({}); // To hold field-specific validation errors

  // Fetch departments on component mount
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    const loadDepartments = async () => {
      try {
          const deptData = await getDepartments();
          if (isMounted) setDepartments(deptData || []);
      } catch (err) {
          console.error("Failed to fetch departments:", err);
          if (isMounted) setFormError("Could not load department list.");
      }
    };
    loadDepartments();
    return () => { isMounted = false; }; // Cleanup function
  }, []); // Empty dependency array means run once on mount

  // Populate form for editing when initialData or isEditing changes
  useEffect(() => {
    if (isEditing && initialData) {
      console.log("Populating form for editing with initialData:", initialData);
      setFormData({
          // Use initialData.id for the internal ID if your API uses it for update
          // employee_api_id: initialData.id, // Example if API uses a different ID
          employee_id: initialData.employee_id || '', // Displayed employee ID
          user_id: initialData.user?.id ?? '', // Link to User model ID
          mobile_phone: initialData.mobile_phone ?? '',
          department_id: initialData.department?.id ?? '', // Use department ID
          job_title: initialData.job_title ?? '',
          employment_type: initialData.employment_type || 'Full-time',
          // Convert date strings to Dayjs objects for DatePicker
          date_joined: initialData.date_joined ? dayjs(initialData.date_joined) : null,
          employee_status: initialData.employee_status || 'Probation',
          // Convert date strings to Dayjs objects for DatePicker
          date_of_birth: initialData.date_of_birth ? dayjs(initialData.date_of_birth) : null,
          gender: initialData.gender ?? '',
          marital_status: initialData.marital_status ?? '',
          home_address: initialData.home_address ?? '',
          nationality: initialData.nationality ?? '',
          // profile_picture: initialData.profile_picture || '', // Set initial picture URL if needed for display
      });
       // Clear file input and preview when populating for edit
      setProfilePictureFile(null);
      setProfilePicturePreview(initialData.profile_picture || null); // Set preview if exists
      const fileInput = document.getElementById('profile-picture-upload');
      if (fileInput) fileInput.value = ''; // Clear native file input value

    } else if (!isEditing) {
       // Reset form to initial state when switching from edit to create
       console.log("Resetting form for creation.");
       setFormData(initialFormState);
       setProfilePictureFile(null);
       setProfilePicturePreview(null);
       const fileInput = document.getElementById('profile-picture-upload');
       if (fileInput) fileInput.value = '';
    }
    // Clear form errors and validation errors when initialData/isEditing changes
     setFormError(null);
     setValidationErrors({});
  }, [initialData, isEditing]); // Dependencies: re-run if initialData or isEditing changes

  // --- Handlers ---

  // Handler for standard text and select inputs
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
    // Clear validation error for the field on change
    setValidationErrors(prevErrors => ({
      ...prevErrors,
      [name]: undefined
    }));
  };

  // Handler for Date Joined DatePicker
  const handleDateChange = (newValue) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      date_joined: newValue // newValue is a Dayjs object or null
    }));
    // Clear validation error for the field on change
     setValidationErrors(prevErrors => ({
        ...prevErrors,
        date_joined: undefined
      }));
  };

  // Handler for Date of Birth DatePicker
  const handleDobChange = (newValue) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      date_of_birth: newValue // newValue is a Dayjs object or null
    }));
    // Clear validation error for the field on change
     setValidationErrors(prevErrors => ({
        ...prevErrors,
        date_of_birth: undefined
      }));
  };

  // Handler for file input (Profile Picture)
  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
       // Clear validation error for the field on change
      setValidationErrors(prevErrors => ({
         ...prevErrors,
         profile_picture: undefined
       }));
    } else {
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
    }
  };

   // Basic Validation Function (Optional but recommended)
   const validateForm = () => {
       const errors = {};
       if (!formData.employee_id && !isEditing) { // Employee ID is required only for creation
           errors.employee_id = 'Employee ID is required.';
       }
       if (!formData.date_joined) {
           errors.date_joined = 'Date Joined is required.';
       }
       if (!formData.employment_type) {
            errors.employment_type = 'Employment Type is required.';
       }
        if (!formData.employee_status) {
            errors.employee_status = 'Employee Status is required.';
        }
       // Add validation for other required fields as needed
       // Example: if (!formData.job_title) errors.job_title = 'Job Title is required';
       setValidationErrors(errors);
       return Object.keys(errors).length === 0; // Return true if no errors
   };


  // --- handleSubmit ---
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default browser form submission

    console.log("Submitting form. isEditing:", isEditing);
    console.log("Current formData:", formData);
    console.log("Profile Picture File:", profilePictureFile);

    // Optional: Run client-side validation before submitting
    // if (!validateForm()) {
    //     console.log("Form validation failed.");
    //     setFormError("Please fill out all required fields correctly.");
    //     return;
    // }


    setLoading(true);
    setFormError(null); // Clear previous errors
    setSuccessOpen(false); // Close previous success snackbar
    setValidationErrors({}); // Clear previous validation errors

    // Prepare data for submission
    // Using FormData is necessary if you're including a file upload
    const dataToSubmit = new FormData();

    // Append form fields to FormData
    Object.keys(formData).forEach(key => {
        const value = formData[key];
        // Handle dates: format Dayjs objects to strings
        if (dayjs.isDayjs(value)) {
             if (value.isValid()) {
                 dataToSubmit.append(key, value.format('YYYY-MM-DD'));
             } else {
                 console.warn(`Invalid date for field: ${key}`, value);
                 // Optionally append empty string or handle as validation error
                 dataToSubmit.append(key, '');
             }
        }
        // Handle null/undefined/empty strings for non-date fields
        // Only append if value is not null or undefined, unless explicitly needed for editing
        else if (value !== null && value !== undefined) {
             // Convert user_id to number if it's a string and not empty
             if (key === 'user_id' && typeof value === 'string' && value !== '') {
                 const numValue = parseInt(value, 10);
                 if (!isNaN(numValue)) {
                     dataToSubmit.append(key, numValue);
                 } else {
                     console.warn(`Invalid user_id value: ${value}. Appending empty string.`);
                     dataToSubmit.append(key, ''); // Append empty string for invalid number
                 }
             } else if (value !== '') { // Append non-empty strings
                dataToSubmit.append(key, value);
             } else if (isEditing && value === '') {
                // If editing and field is explicitly cleared/empty string, send empty string
                // This signals backend to potentially clear the value
                 dataToSubmit.append(key, '');
             }
             // Note: If creating and a field is '', it won't be appended unless you change the logic here
        }
    });

    // Append the profile picture file if selected
    if (profilePictureFile) {
       dataToSubmit.append('profile_picture', profilePictureFile);
    } else if (isEditing && initialData?.profile_picture && profilePicturePreview === null) {
       // If editing, employee *had* a picture, but user cleared the input using the remove button.
       // Signal the backend to remove the picture. Common ways:
       // 1. Send a specific flag (e.g., dataToSubmit.append('clear_profile_picture', 'true'))
       // 2. Send the field with a specific value (e.g., dataToSubmit.append('profile_picture', 'DELETE'))
       // 3. Send the field as null or empty string (less reliable if API doesn't distinguish empty string vs no change)
       // Let's assume sending profile_picture as an empty string signals removal for simplicity.
       console.log("Signaling backend to remove profile picture.");
       dataToSubmit.append('profile_picture', '');
    }
    // If editing, no new file selected, AND profilePicturePreview is NOT null,
    // it means the user didn't change or remove the existing picture.
    // In this case, do NOT append the 'profile_picture' key at all.
    // This prevents resending the existing URL to the backend.


    try {
        let resultEmployee;
        if (isEditing) {
            // Call update API - assumes initialData.id is the unique identifier for update
            // You MUST make sure initialData.id holds the correct backend ID for the employee.
            // If your backend uses employee_id for updates, change initialData.id below.
            if (!initialData?.id) {
                 throw new Error("Employee ID missing for update.");
            }
            console.log("Calling updateEmployee API for ID:", initialData.id);
            resultEmployee = await updateEmployee(initialData.id, dataToSubmit);
            setSuccessMessage('Employee updated successfully!');
            if (onEmployeeUpdated) {
                 onEmployeeUpdated(resultEmployee); // Notify parent on successful update, pass returned data
            }
        } else {
            // Call create API
            console.log("Calling createEmployee API");
             // If backend requires employee_id only on create and not in payload:
            // const { employee_id, ...createPayload } = Object.fromEntries(dataToSubmit.entries());
            // resultEmployee = await createEmployee(createPayload); // Adjust as per your API
            resultEmployee = await createEmployee(dataToSubmit);
            setSuccessMessage('Employee created successfully!');
             if (onEmployeeCreated) {
                onEmployeeCreated(resultEmployee); // Notify parent on successful creation, pass returned data
             }
             // Optional: Navigate to the detail page of the new employee after creation
             // Make sure the API returns the employee object with an identifier (like id or employee_id)
             if (resultEmployee && resultEmployee.employee_id) {
                  // navigate(`/employees/${resultEmployee.employee_id}`);
                  console.log("New employee created, consider navigating to detail page:", resultEmployee.employee_id);
             } else {
                 console.warn("New employee created, but cannot navigate: employee_id not returned in response.");
             }
             // Clear form after successful creation (optional)
             setFormData(initialFormState);
             setProfilePictureFile(null);
             setProfilePicturePreview(null);
             const fileInput = document.getElementById('profile-picture-upload');
             if (fileInput) fileInput.value = '';
        }

        console.log("API call successful. Result:", resultEmployee);
        setSuccessOpen(true); // Show success snackbar

    } catch (err) {
        console.error("API call failed:", err);
        // Handle API errors, especially validation errors from the backend
        if (err.response && err.response.data) {
            const errorData = err.response.data;
            console.log("Backend response error data:", errorData);

            // Check for non-field errors first
            if (errorData.non_field_errors) {
                 setFormError(`Submission Error: ${errorData.non_field_errors.join(', ')}`);
            } else if (typeof errorData === 'object' && errorData !== null) {
                // Assume errorData is an object of field errors
                 setValidationErrors(errorData);
                 setFormError("Please correct the errors below.");
            } else if (typeof errorData === 'string') {
                 // Handle plain string error responses
                 setFormError(`Submission Error: ${errorData}`);
            }
            else {
                 // Fallback for unexpected error response format
                 setFormError(`An unexpected error occurred: ${err.message || err.toString()}`);
            }

        } else {
            // Handle network errors or unexpected responses without response.data
             setFormError(`An error occurred during submission: ${err.message || err.toString()}`);
        }

    } finally {
        setLoading(false); // Always stop loading
    }
  };

  // Handler to close the success snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessOpen(false);
  };

  // Function to remove the profile picture preview and file selection
  const handleRemovePicture = () => {
      console.log("Removing profile picture client-side.");
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      // Clear the native file input value as well
      const fileInput = document.getElementById('profile-picture-upload');
      if (fileInput) fileInput.value = '';
      // handleSubmit will check if profilePicturePreview is null for an *existing* employee
      // to determine if the backend should be signaled to remove the picture.
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ mt: 1, p: { xs: 2, md: 3 }, mb: 3 }} elevation={2}>
        <Typography component="h2" variant="h6" gutterBottom sx={{ mb: 2 }}>
          {isEditing ? `Edit Employee (ID: ${initialData?.employee_id || 'N/A'})` : 'Create New Employee'}
        </Typography>
        {/* Display general form errors */}
        {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}

        {/* Grid container for form fields */}
        <Grid container spacing={2}>

            {/* --- Job Information --- */}
            {/* Grid item corrected by adding 'item' prop */}
            <Grid item xs={12}><Divider sx={{ mt: 1, mb: 1.5 }}><Typography variant="subtitle2" color="text.secondary">Job Information</Typography></Divider></Grid>
            {/* Employee ID field - disabled if editing */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Employee ID"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                required={!isEditing} // Required only for creation
                fullWidth
                variant="outlined"
                disabled={loading || isEditing} // Disable if loading or editing
                error={!!validationErrors.employee_id}
                helperText={validationErrors.employee_id}
              />
            </Grid>
             {/* Date Joined DatePicker */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                 label="Date Joined *"
                 // value={formData.date_joined || null} // Ensure value is null or Dayjs object
                 value={formData.date_joined}
                 onChange={handleDateChange}
                 format="YYYY-MM-DD" // Standard date format
                 sx={{ width: '100%' }} // Make date picker full width
                 slotProps={{ // Pass props to the underlying TextField
                   textField: {
                     required: true,
                     variant: "outlined",
                     error: !!validationErrors.date_joined, // Show error state
                     helperText: validationErrors.date_joined, // Display validation message
                   }
                 }}
                 disabled={loading} // Disable if loading
              />
            </Grid>
            {/* Department Select */}
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" disabled={loading} error={!!validationErrors.department_id}>
                    <InputLabel id="department-id-label">Department</InputLabel>
                    <Select
                        labelId="department-id-label"
                        name="department_id"
                        // Use formData state value, default to '' for displayEmpty
                        value={formData.department_id}
                        label="Department" // Corresponds to InputLabel
                        onChange={handleChange}
                        displayEmpty // Allows the "Select Department..." option to be shown when value is ''
                    >
                        {/* Option with empty value for the placeholder */}
                        <MenuItem value=""><em>Select Department...</em></MenuItem>
                        {/* Render department options */}
                        {departments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                        ))}
                    </Select>
                     {/* Display validation error message */}
                     {validationErrors.department_id && <FormHelperText>{validationErrors.department_id}</FormHelperText>}
                </FormControl>
            </Grid>
            {/* Job Title TextField */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Job Title"
                name="job_title"
                value={formData.job_title} // Use formData state value
                onChange={handleChange} // Call handler on change
                fullWidth
                variant="outlined"
                disabled={loading}
                error={!!validationErrors.job_title} // Show error state
                helperText={validationErrors.job_title} // Display validation message
              />
            </Grid>
            {/* Employment Type Select */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={loading} variant="outlined" error={!!validationErrors.employment_type}>
                 <InputLabel>Employment Type</InputLabel>
                 <Select
                     name="employment_type"
                     value={formData.employment_type} // Use formData state value
                     label="Employment Type *" // Corresponds to InputLabel
                     onChange={handleChange} // Call handler on change
                     displayEmpty
                 >
                     <MenuItem value=""><em>Select Employment Type...</em></MenuItem> {/* Added empty option */}
                     {EMPLOYMENT_TYPES.map((o)=><MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                 </Select>
                 {validationErrors.employment_type && <FormHelperText>{validationErrors.employment_type}</FormHelperText>}
              </FormControl>
            </Grid>
            {/* Employee Status Select */}
            <Grid item xs={12} sm={6}>
               <FormControl fullWidth required disabled={loading} variant="outlined" error={!!validationErrors.employee_status}>
                 <InputLabel>Employee Status</InputLabel>
                 <Select
                     name="employee_status"
                     value={formData.employee_status} // Use formData state value
                     label="Employee Status *" // Corresponds to InputLabel
                     onChange={handleChange} // Call handler on change
                     displayEmpty
                 >
                     <MenuItem value=""><em>Select Status...</em></MenuItem> {/* Added empty option */}
                     {EMPLOYEE_STATUSES.map((o)=><MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                 </Select>
                 {validationErrors.employee_status && <FormHelperText>{validationErrors.employee_status}</FormHelperText>}
               </FormControl>
            </Grid>

            {/* --- Divider --- */}
            <Grid item xs={12}><Divider sx={{ my: 1.5 }}><Typography variant="subtitle2" color="text.secondary">Personal Details</Typography></Divider></Grid>

             {/* Date of Birth DatePicker */}
            <Grid item xs={12} sm={6}>
             <DatePicker
                label="Date of Birth"
                value={formData.date_of_birth} // Use formData state value
                onChange={handleDobChange} // Call handler on change
                format="YYYY-MM-DD"
                sx={{ width: '100%' }}
                slotProps={{
                   textField: {
                     variant: "outlined",
                     error: !!validationErrors.date_of_birth, // Show error state
                     helperText: validationErrors.date_of_birth, // Display validation message
                   }
                 }}
                disabled={loading}
             />
            </Grid>
             {/* Nationality Select */}
            <Grid item xs={12} sm={6}>
                 <FormControl fullWidth disabled={loading} variant="outlined" error={!!validationErrors.nationality}>
                      <InputLabel id="nationality-label">Nationality</InputLabel>
                      <Select
                          labelId="nationality-label"
                          value={formData.nationality} // Use formData state value
                          name="nationality" // Name for handleChange
                          label="Nationality"
                          onChange={handleChange} // Call handler on change
                          displayEmpty
                      >
                         <MenuItem value=""><em>Select Nationality...</em></MenuItem>
                         {COUNTRIES.map((option) => (<MenuItem key={option.code} value={option.label}>{option.label}</MenuItem>))}
                      </Select>
                      {validationErrors.nationality && <FormHelperText>{validationErrors.nationality}</FormHelperText>}
                 </FormControl>
             </Grid>
            {/* Gender Select */}
             <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={loading} variant="outlined" error={!!validationErrors.gender}>
                       <InputLabel id="gender-label">Gender</InputLabel>
                       <Select
                           labelId="gender-label"
                           name="gender" // Name for handleChange
                           value={formData.gender} // Use formData state value
                           label="Gender"
                           onChange={handleChange} // Call handler on change
                           displayEmpty
                       >
                           <MenuItem value=""><em>Select Gender...</em></MenuItem>
                           {GENDERS.map((o)=><MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                       </Select>
                       {validationErrors.gender && <FormHelperText>{validationErrors.gender}</FormHelperText>}
                  </FormControl>
              </Grid>
            {/* Marital Status Select */}
              <Grid item xs={12} sm={6}>
                   <FormControl fullWidth disabled={loading} variant="outlined" error={!!validationErrors.marital_status}>
                        <InputLabel id="marital-status-label">Marital Status</InputLabel>
                        <Select
                            labelId="marital-status-label"
                            name="marital_status" // Name for handleChange
                            value={formData.marital_status} // Use formData state value
                            label="Marital Status"
                            onChange={handleChange} // Call handler on change
                            displayEmpty
                        >
                           <MenuItem value=""><em>Select Status...</em></MenuItem>
                           {MARITAL_STATUSES.map((o)=><MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                        </Select>
                        {validationErrors.marital_status && <FormHelperText>{validationErrors.marital_status}</FormHelperText>}
                   </FormControl>
               </Grid>

            {/* --- Divider --- */}
            <Grid item xs={12}><Divider sx={{ my: 1.5 }}><Typography variant="subtitle2" color="text.secondary">Contact Information & Address</Typography></Divider></Grid>

             {/* Mobile Phone TextField */}
             <Grid item xs={12} sm={6}>
               <TextField
                 label="Mobile Phone"
                 name="mobile_phone" // Name for handleChange
                 value={formData.mobile_phone} // Use formData state value
                 onChange={handleChange} // Call handler on change
                 fullWidth
                 variant="outlined"
                 disabled={loading}
                 error={!!validationErrors.mobile_phone}
                 helperText={validationErrors.mobile_phone}
               />
             </Grid>
             {/* User ID Link TextField (Optional) */}
             <Grid item xs={12} sm={6}>
               <TextField
                 label="User ID Link (Optional)"
                 name="user_id" // Name for handleChange
                 type="number" // Use type="number" for numeric input
                 value={formData.user_id} // Use formData state value
                 onChange={handleChange} // Call handler on change
                 fullWidth
                 variant="outlined"
                 disabled={loading}
                 helperText={validationErrors.user_id || "Link to a User account for login access."} // Display validation or general helper text
                 error={!!validationErrors.user_id} // Show error state
                  InputLabelProps={{ shrink: true }} // Keep label shrunk for type="number" with initial value
               />
             </Grid>
             {/* Home Address TextField */}
              <Grid item xs={12}>
                 <TextField
                   label="Home Address"
                   name="home_address" // Name for handleChange
                   value={formData.home_address} // Use formData state value
                   onChange={handleChange} // Call handler on change
                   fullWidth
                   variant="outlined"
                   multiline // Enable multiline input
                   rows={3} // Set default number of rows
                   disabled={loading}
                   error={!!validationErrors.home_address} // Show error state
                   helperText={validationErrors.home_address} // Display validation message
                 />
              </Grid>


            {/* --- Divider --- */}
            <Grid item xs={12}><Divider sx={{ my: 1.5 }}><Typography variant="subtitle2" color="text.secondary">Profile Picture</Typography></Divider></Grid>


             {/* --- Profile Picture Upload --- */}
             <Grid item xs={12}>
                 <Box sx={{ mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                     <Button
                         component="label" // Makes the button trigger the file input
                         variant="outlined"
                         startIcon={<CloudUploadIcon />}
                         htmlFor="profile-picture-upload" // Links button to the hidden input
                         disabled={loading}
                     >
                         {profilePictureFile ? 'Change Picture' : (isEditing ? 'Upload New Picture' : 'Upload Picture')}
                         {/* Hidden file input */}
                         <input
                             type="file"
                             accept="image/*" // Only accept image files
                             hidden // Hide the default file input
                             id="profile-picture-upload" // Must match htmlFor on the button
                             onChange={handleFileChange} // Call handler when file is selected
                             // Reset the input value when profilePictureFile or initialData changes
                             // key={profilePictureFile || (isEditing ? initialData?.profile_picture : 'new')}
                         />
                     </Button>
                      {/* Display selected file name or current picture info */}
                      {profilePictureFile && (
                          <Typography variant="body2" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                              New file: {profilePictureFile.name}
                          </Typography>
                      )}
                       {/* Display current picture info when editing and no new file selected */}
                       {isEditing && initialData?.profile_picture && !profilePictureFile && (
                           <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                               Current: {initialData.profile_picture.split('/').pop() || 'Picture Available'} {/* Display filename or generic text */}
                           </Typography>
                       )}
                 </Box>
                  {/* Show preview of the selected/current image */}
                  {/* Show preview if a new file is selected OR if editing and there's an initial picture AND no new file is selected */}
                 {(profilePicturePreview || (isEditing && initialData?.profile_picture && !profilePictureFile)) && (
                     <Box sx={{ mt: 2, position: 'relative', width: 150, height: 150, border: '1px dashed #ccc', borderRadius: 1, overflow: 'hidden' }}>
                         <img
                             src={profilePicturePreview || initialData?.profile_picture} // Use preview URL or current picture URL
                             alt="Profile Preview"
                             style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                         />
                          {/* Button to remove the picture preview/selection */}
                          {/* Use IconButton here */}
                          <IconButton // <-- Use the imported IconButton
                              onClick={handleRemovePicture}
                              sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  bgcolor: 'rgba(255,255,255,0.7)',
                                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                                  padding: '4px' // Adjust padding if needed
                              }}
                              size="small"
                          >
                             <CloseIcon fontSize="small" />
                          </IconButton>
                     </Box>
                 )}
                 {validationErrors.profile_picture && <FormHelperText error>{validationErrors.profile_picture}</FormHelperText>}
             </Grid>


        </Grid> {/* End Grid container */}

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={onCancel} disabled={loading} color="secondary" variant="outlined">
                Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Update Employee' : 'Create Employee')}
            </Button>
        </Box>

        {/* Success Snackbar */}
        <Snackbar open={successOpen} autoHideDuration={4000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }} variant="filled">
            {successMessage}
          </Alert>
        </Snackbar>

      </Paper>
    </LocalizationProvider>
  );
}

export default EmployeeForm;