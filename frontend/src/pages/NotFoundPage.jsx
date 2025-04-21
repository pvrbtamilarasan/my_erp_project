// frontend/src/pages/NotFoundPage.jsx
import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom'; // Import Link for navigation

function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8, p: 3, border: '1px solid #ddd', borderRadius: '8px' }}>
      <Typography variant="h1" component="h1" color="error" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Sorry, the page you are looking for does not exist or may have been moved.
      </Typography>
      <Button component={Link} to="/" variant="contained"> {/* Use Button with Link */}
        Go Back Home
      </Button>
    </Container>
  );
}

export default NotFoundPage;