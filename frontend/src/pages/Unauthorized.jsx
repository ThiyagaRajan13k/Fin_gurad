import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh">
      <Typography variant="h2" color="error.main" fontWeight="bold">403</Typography>
      <Typography variant="h5" mt={2} mb={4}>You don't have permission to access this page.</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Return to Dashboard</Button>
    </Box>
  );
};
export default Unauthorized;
