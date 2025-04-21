// frontend/src/components/LoginForm.jsx

import React, { useState } from 'react';
import { loginUser } from '../services/api';

// Import MUI components
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// *** Remove the temporary LoginSuccessMessage component if you added it ***

// Accept onLoginSuccess function as a prop
function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // We don't need loginSuccessData state anymore

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginUser(username, password);
      console.log('Login successful:', data);

      // --- Call the callback function passed from App.jsx ---
      // Pass the received data (which includes the token) up to the parent
      if (onLoginSuccess) {
        onLoginSuccess(data); // Pass the data object (e.g., { key: '...' })
      }
      // --- TODO: Actual token storage will happen in App.jsx's handler ---

    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '400px',
        margin: 'auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        marginTop: '50px',
      }}
      noValidate
      autoComplete="off"
    >
      <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
        Sign In
      </Typography>
      {/* TextFields remain the same */}
       <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username or Email"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      {error && (
        <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
          {error}
        </Alert>
      )}

      {/* Remove the temporary LoginSuccessMessage display here */}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>
    </Box>
  );
}

export default LoginForm;