import React, { useState } from 'react';
import { Box, Card, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Cannot connect to server. Check terminal.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#0A192F',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <Box sx={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(10,25,47,0) 70%)' }} />
      <Box sx={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(10,25,47,0) 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card sx={{ 
          p: 5, 
          width: { xs: 320, sm: 400 }, 
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.main', mb: 2, color: 'white' }}>
              <ShieldCheck size={32} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary.main">FinGuard</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>Supply Chain Finance & Fraud Detection</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>
          <Typography variant="body2" align="center" color="text.secondary" mt={2}>
            Demo Accounts: admin, supplier, analyst, bank (pwd: *123)
          </Typography>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Login;
