import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { createUser, updateUser } from '../../services/userService';

const UserFormModal = ({ open, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'ROLE_SUPPLIER'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        password: '', // Don't populate password on edit
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || 'ROLE_SUPPLIER'
      });
    } else {
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: 'ROLE_SUPPLIER'
      });
    }
    setError('');
  }, [user, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        await updateUser(user.id, formData);
      } else {
        await createUser(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle fontWeight="bold">{user ? 'Edit User' : 'Create New User'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Box color="error.main" mb={2}>{error}</Box>}
          
          <TextField
            fullWidth margin="normal" label="Full Name" name="fullName"
            value={formData.fullName} onChange={handleChange} required
          />
          <TextField
            fullWidth margin="normal" label="Email" name="email" type="email"
            value={formData.email} onChange={handleChange} required
          />
          <TextField
            fullWidth margin="normal" label="Username" name="username"
            value={formData.username} onChange={handleChange} required disabled={!!user}
          />
          <TextField
            fullWidth margin="normal" label={user ? "Password (leave blank to keep current)" : "Password"} 
            name="password" type="password"
            value={formData.password} onChange={handleChange} required={!user}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select name="role" value={formData.role} onChange={handleChange} label="Role">
              <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
              <MenuItem value="ROLE_SUPPLIER">Supplier</MenuItem>
              <MenuItem value="ROLE_BANK_OFFICER">Bank Officer</MenuItem>
              <MenuItem value="ROLE_FRAUD_ANALYST">Fraud Analyst</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {user ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserFormModal;
