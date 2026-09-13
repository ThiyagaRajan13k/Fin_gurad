import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Financing = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [viewRequest, setViewRequest] = useState(null);
  const [newRequest, setNewRequest] = useState({
    customerId: '',
    invoiceId: '',
    tenureDays: 30,
    amountRequested: '',
    remarks: ''
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/financing');
        setRequests(response.data.data);
      } catch (error) {
        console.error('Failed to fetch financing requests', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchDropdownData = async () => {
      if (user?.role === 'ROLE_SUPPLIER') {
        try {
          const [custRes, invRes] = await Promise.all([
            api.get('/customers'),
            api.get('/invoices')
          ]);
          setCustomers(custRes.data.data || []);
          setInvoices(invRes.data.data || []);
        } catch (error) {
          console.error('Failed to fetch dropdown data', error);
        }
      }
    };

    fetchRequests();
    fetchDropdownData();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'DISBURSED': return 'success';
      case 'REPAID': return 'secondary';
      case 'UNDER_REVIEW': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const handleCreateRequest = async () => {
    try {
      const payload = {
        customerId: newRequest.customerId,
        tenureDays: newRequest.tenureDays,
        remarks: newRequest.remarks,
        items: [
          {
            invoiceId: newRequest.invoiceId,
            amountRequested: newRequest.amountRequested || null
          }
        ]
      };
      await api.post('/financing', payload);
      setOpenDialog(false);
      setNewRequest({ customerId: '', invoiceId: '', tenureDays: 30, amountRequested: '', remarks: '' });
      // Refresh list
      const response = await api.get('/financing');
      setRequests(response.data.data);
    } catch (error) {
      console.error('Failed to create financing request', error);
      alert('Failed to create request');
    }
  };

  const usedInvoiceIds = new Set(
    requests
      .filter(req => req.status !== 'REJECTED')
      .flatMap(req => req.items ? req.items.map(item => item.invoiceId) : [])
  );

  const availableInvoices = invoices.filter(inv => 
    inv.customerId === newRequest.customerId && 
    inv.status === 'ISSUED' && 
    !usedInvoiceIds.has(inv.id)
  );

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Financing Requests
        </Typography>
        {user?.role === 'ROLE_SUPPLIER' && (
          <Button variant="contained" color="primary" startIcon={<FileText size={18} />} onClick={() => setOpenDialog(true)}>
            New Request
          </Button>
        )}
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell>Request #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Tenure (Days)</TableCell>
                <TableCell align="right">Requested</TableCell>
                <TableCell align="right">Approved</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>Loading...</TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No financing requests found</TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell fontWeight="500">{req.requestNumber}</TableCell>
                    <TableCell>{req.customerName}</TableCell>
                    <TableCell>{req.tenureDays}</TableCell>
                    <TableCell align="right">₹{req.totalAmountRequested?.toLocaleString()}</TableCell>
                    <TableCell align="right">₹{req.totalAmountApproved?.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Chip label={req.status} size="small" color={getStatusColor(req.status)} />
                    </TableCell>
                    <TableCell align="right">
                      {user?.role !== 'ROLE_SUPPLIER' && req.status === 'UNDER_REVIEW' ? (
                        <>
                          <IconButton size="small" color="success" onClick={() => setViewRequest(req)}>
                            <CheckCircle size={18} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setViewRequest(req)}>
                            <XCircle size={18} />
                          </IconButton>
                        </>
                      ) : (
                        <IconButton size="small" color="primary" onClick={() => setViewRequest(req)}>
                          <FileText size={18} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Financing Request</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Customer</InputLabel>
              <Select
                value={newRequest.customerId}
                label="Customer"
                onChange={(e) => setNewRequest({ ...newRequest, customerId: e.target.value, invoiceId: '' })}
              >
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!newRequest.customerId}>
              <InputLabel>Invoice to Finance</InputLabel>
              <Select
                value={newRequest.invoiceId}
                label="Invoice to Finance"
                onChange={(e) => {
                  const inv = availableInvoices.find(i => i.id === e.target.value);
                  setNewRequest({ ...newRequest, invoiceId: e.target.value, amountRequested: inv ? inv.totalAmount : '' });
                }}
              >
                {availableInvoices.length === 0 && <MenuItem disabled value="">No issued invoices available</MenuItem>}
                {availableInvoices.map((inv) => (
                  <MenuItem key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - ₹{inv.totalAmount}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Amount Requested (₹)"
              type="number"
              fullWidth
              value={newRequest.amountRequested}
              onChange={(e) => setNewRequest({ ...newRequest, amountRequested: e.target.value })}
              disabled={!newRequest.invoiceId}
            />

            <TextField
              label="Tenure (Days)"
              type="number"
              fullWidth
              value={newRequest.tenureDays}
              onChange={(e) => setNewRequest({ ...newRequest, tenureDays: e.target.value })}
            />

            <TextField
              label="Remarks / Purpose"
              fullWidth
              multiline
              rows={2}
              value={newRequest.remarks}
              onChange={(e) => setNewRequest({ ...newRequest, remarks: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateRequest}
            disabled={!newRequest.customerId || !newRequest.invoiceId}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!viewRequest} onClose={() => setViewRequest(null)} maxWidth="sm" fullWidth>
        {viewRequest && (
          <>
            <DialogTitle>Request Details: {viewRequest.requestNumber}</DialogTitle>
            <DialogContent dividers>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Customer</Typography>
                  <Typography fontWeight="500">{viewRequest.customerName}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Status</Typography>
                  <Chip label={viewRequest.status} size="small" color={getStatusColor(viewRequest.status)} />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Requested Amount</Typography>
                  <Typography fontWeight="500">₹{viewRequest.totalAmountRequested?.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Approved Amount</Typography>
                  <Typography fontWeight="500">₹{viewRequest.totalAmountApproved?.toLocaleString() || '0'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">Tenure</Typography>
                  <Typography fontWeight="500">{viewRequest.tenureDays} Days</Typography>
                </Box>
                {viewRequest.interestRate && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="text.secondary">Interest Rate</Typography>
                    <Typography fontWeight="500">{viewRequest.interestRate}%</Typography>
                  </Box>
                )}
                {viewRequest.remarks && (
                  <Box mt={2}>
                    <Typography color="text.secondary">Remarks</Typography>
                    <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                      {viewRequest.remarks}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setViewRequest(null)} variant="contained">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Financing;
