import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Plus } from 'lucide-react';
import { getCustomers, createCustomer } from '../../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    customerCode: '',
    gstNumber: '',
    contactNumber: '',
    email: '',
    address: '',
    creditLimit: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data.data.data || data.data); // Handle both wrapped and unwrapped for safety
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      await createCustomer(newCustomer);
      setOpenDialog(false);
      setNewCustomer({ name: '', customerCode: '', gstNumber: '', contactNumber: '', email: '', address: '', creditLimit: '' });
      fetchCustomers();
    } catch (error) {
      console.error("Failed to create customer", error);
      alert("Failed to create customer");
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Customer Master</Typography>
        <Button variant="contained" color="primary" startIcon={<Plus size={18} />} onClick={() => setOpenDialog(true)}>
          New Customer
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>GST Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Credit Limit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>
                  <Chip label={customer.customerCode} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.gstNumber}</TableCell>
                <TableCell>{customer.contactNumber}</TableCell>
                <TableCell>₹{customer.creditLimit}</TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>No customers found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField label="Customer Name" fullWidth value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
            <TextField label="Customer Code" fullWidth value={newCustomer.customerCode} onChange={(e) => setNewCustomer({ ...newCustomer, customerCode: e.target.value })} />
            <TextField label="GST Number" fullWidth value={newCustomer.gstNumber} onChange={(e) => setNewCustomer({ ...newCustomer, gstNumber: e.target.value })} />
            <TextField label="Contact Number" fullWidth value={newCustomer.contactNumber} onChange={(e) => setNewCustomer({ ...newCustomer, contactNumber: e.target.value })} />
            <TextField label="Email" type="email" fullWidth value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
            <TextField label="Address" fullWidth multiline rows={2} value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} />
            <TextField label="Credit Limit (₹)" type="number" fullWidth value={newCustomer.creditLimit} onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCustomer} disabled={!newCustomer.name || !newCustomer.customerCode}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;
