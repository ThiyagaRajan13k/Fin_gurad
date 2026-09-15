import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, Alert, AlertTitle } from '@mui/material';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Landmark, ShieldAlert, Settings, Plus, CreditCard, AlertTriangle } from 'lucide-react';
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

  // Bank accounts state initialized with user's saved accounts.
  // Initially includes Indian Bank account so only banks the user has an account in are available.
  const [bankAccounts, setBankAccounts] = useState(() => {
    const saved = localStorage.getItem('finguard_user_bank_accounts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { name: 'Indian Bank', accountNumber: '20194827101928', cifNumber: 'CIF9928143', label: 'Indian Bank •••• 1928' }
    ];
  });

  const [newRequest, setNewRequest] = useState({
    customerId: '',
    invoiceId: '',
    bankAccount: 'Indian Bank •••• 1928',
    bankName: 'Indian Bank',
    tenureDays: 30,
    amountRequested: '',
    remarks: 'Working capital for raw material purchase'
  });

  const [openBankDialog, setOpenBankDialog] = useState(false);
  const [newBankForm, setNewBankForm] = useState({
    selectedBank: 'Indian Bank',
    accountNumber: '',
    cifNumber: ''
  });

  const handleSaveBankAccount = () => {
    if (!newBankForm.accountNumber.trim() || !newBankForm.cifNumber.trim()) {
      alert('Please fill in both Account Number and CIF Number');
      return;
    }
    const bankName = newBankForm.selectedBank;
    const last4 = newBankForm.accountNumber.trim().slice(-4) || '0000';
    const newEntry = {
      name: bankName,
      accountNumber: newBankForm.accountNumber.trim(),
      cifNumber: newBankForm.cifNumber.trim(),
      label: `${bankName} •••• ${last4}`
    };

    const updated = [...bankAccounts, newEntry];
    setBankAccounts(updated);
    localStorage.setItem('finguard_user_bank_accounts', JSON.stringify(updated));

    // Automatically select the newly created bank account for the current request
    setNewRequest(prev => ({
      ...prev,
      bankAccount: newEntry.label,
      bankName: newEntry.name
    }));

    setOpenBankDialog(false);
    setNewBankForm({ selectedBank: 'Indian Bank', accountNumber: '', cifNumber: '' });
  };

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
        bankAccount: newRequest.bankAccount,
        bankName: newRequest.bankName,
        items: [
          {
            invoiceId: newRequest.invoiceId,
            amountRequested: newRequest.amountRequested || null
          }
        ]
      };
      await api.post('/financing', payload);
      setOpenDialog(false);
      setNewRequest({
        customerId: '',
        invoiceId: '',
        bankAccount: bankAccounts[0]?.label || '',
        bankName: bankAccounts[0]?.name || '',
        tenureDays: 30,
        amountRequested: '',
        remarks: 'Working capital for raw material purchase'
      });
      // Refresh list
      const response = await api.get('/financing');
      setRequests(response.data.data);
    } catch (error) {
      console.error('Failed to create financing request', error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to create request';
      alert('Failed to create request: ' + errMsg);
    }
  };

  const usedInvoiceIds = new Set(
    requests
      .filter(req => req.status !== 'REJECTED')
      .flatMap(req => req.items ? req.items.map(item => item.invoiceId) : [])
  );

  // Allow all issued invoices for customer, noting whether already financed so users can test duplicate/cross-bank flow
  const availableInvoices = invoices.filter(inv => 
    !newRequest.customerId || inv.customerId === newRequest.customerId
  );

  const selectedInvoice = invoices.find(i => i.id === newRequest.invoiceId);
  const isInvoiceAlreadyFinanced = selectedInvoice && usedInvoiceIds.has(selectedInvoice.id);
  const priorRequest = requests.find(r => 
    r.status !== 'REJECTED' && r.items && r.items.some(item => item.invoiceId === newRequest.invoiceId)
  );

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Financing Requests
        </Typography>
        <Box display="flex" gap={1.5}>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<Plus size={18} />} 
            onClick={() => setOpenBankDialog(true)}
          >
            Add Bank Account
          </Button>
          {user?.role === 'ROLE_SUPPLIER' && (
            <Button variant="contained" color="primary" startIcon={<FileText size={18} />} onClick={() => setOpenDialog(true)}>
              New Request
            </Button>
          )}
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell>Request #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Bank</TableCell>
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
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>Loading...</TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>No financing requests found</TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell fontWeight="500">{req.requestNumber}</TableCell>
                    <TableCell>{req.customerName}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Landmark size={15} style={{ color: '#1976d2' }} />
                        <Typography variant="body2" fontWeight="500">
                          {req.bankAccount || req.bankName || 'Indian Bank •••• 1928'}
                        </Typography>
                      </Box>
                    </TableCell>
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

      {/* New Financing Request Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Financing Request</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            {/* Bank Account Selector */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  Bank Account *
                </Typography>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={0.5} 
                  sx={{ color: 'primary.main', cursor: 'pointer', fontSize: '0.75rem' }}
                  onClick={() => setOpenBankDialog(true)}
                >
                  <Plus size={12} />
                  <span>Add Bank Account</span>
                </Box>
              </Box>
              <FormControl fullWidth size="small">
                <Select
                  value={newRequest.bankAccount}
                  onChange={(e) => {
                    const acc = bankAccounts.find(b => b.label === e.target.value);
                    setNewRequest({
                      ...newRequest,
                      bankAccount: e.target.value,
                      bankName: acc ? acc.name : ''
                    });
                  }}
                  displayEmpty
                  renderValue={(value) => {
                    if (!value) {
                      return <Typography variant="body2" color="text.secondary">Select an account</Typography>;
                    }
                    return (
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Landmark size={18} style={{ color: '#1976d2' }} />
                        <Typography variant="body2" fontWeight="500">{value}</Typography>
                      </Box>
                    );
                  }}
                >
                  {bankAccounts.length === 0 ? (
                    <MenuItem disabled value="">
                      <em>No bank accounts found. Please add a bank account first.</em>
                    </MenuItem>
                  ) : (
                    bankAccounts.map((acc) => (
                      <MenuItem key={acc.label} value={acc.label}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Landmark size={16} />
                          <span>{acc.label} ({acc.name})</span>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Only the banks in which you have an active account appear in this phase.
              </Typography>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Customer *</InputLabel>
              <Select
                value={newRequest.customerId}
                label="Customer *"
                onChange={(e) => setNewRequest({ ...newRequest, customerId: e.target.value, invoiceId: '' })}
              >
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!newRequest.customerId}>
              <InputLabel>Invoice to Finance *</InputLabel>
              <Select
                value={newRequest.invoiceId}
                label="Invoice to Finance *"
                onChange={(e) => {
                  const inv = availableInvoices.find(i => i.id === e.target.value);
                  setNewRequest({ ...newRequest, invoiceId: e.target.value, amountRequested: inv ? inv.totalAmount : '' });
                }}
              >
                {availableInvoices.length === 0 && <MenuItem disabled value="">No invoices found for this customer</MenuItem>}
                {availableInvoices.map((inv) => {
                  const isFinanced = usedInvoiceIds.has(inv.id);
                  return (
                    <MenuItem key={inv.id} value={inv.id}>
                      <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                        <span>{inv.invoiceNumber} | ₹{inv.totalAmount?.toLocaleString()} | {inv.customerName || 'Customer'}</span>
                        {isFinanced && (
                          <Chip label="Already Financed" size="small" color="warning" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <ShieldAlert size={14} color="#1976d2" />
                Select an invoice. Submitting an already-financed invoice triggers duplicate/cross-bank fraud verification.
              </Typography>
            </FormControl>

            {/* Prominent warning when an already used invoice is selected */}
            {isInvoiceAlreadyFinanced && (
              <Alert 
                severity="error" 
                icon={<AlertTriangle size={24} color="#d32f2f" />}
                sx={{ 
                  border: '2px solid #d32f2f', 
                  bgcolor: '#fff5f5', 
                  borderRadius: 2,
                  '& .MuiAlert-message': { width: '100%' }
                }}
              >
                <AlertTitle sx={{ fontWeight: 'bold', color: '#b71c1c', fontSize: '0.95rem' }}>
                  ⚠️ WARNING: INVOICE ALREADY FINANCED!
                </AlertTitle>
                <Typography variant="body2" sx={{ color: '#b71c1c', mb: 1, fontWeight: 500 }}>
                  Invoice <strong>{selectedInvoice?.invoiceNumber}</strong> has already been used for financing:
                </Typography>
                <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5, border: '1px dashed #ef9a9a', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
                    • <strong>Previous Request #:</strong> <span style={{ color: '#000' }}>{priorRequest?.requestNumber || 'Previous Request'}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
                    • <strong>Previously Financed Bank Account:</strong> <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{priorRequest?.bankAccount || priorRequest?.bankName || 'Indian Bank •••• 1928'}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    • <strong>Current Target Bank Account:</strong> <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{newRequest.bankAccount || newRequest.bankName}</span>
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#c62828', fontWeight: 600, display: 'block' }}>
                  🚨 If you proceed with this submission, it will be automatically <strong>FLAGGED as Duplicate / Cross-Bank Fraud</strong> by the Fraud Detection Engine and escalated directly to the Fraud Analyst with a severe risk penalty.
                </Typography>
              </Alert>
            )}

            <TextField
              label="Amount Requested (₹) *"
              type="number"
              fullWidth
              value={newRequest.amountRequested}
              onChange={(e) => setNewRequest({ ...newRequest, amountRequested: e.target.value })}
              disabled={!newRequest.invoiceId}
            />

            <TextField
              label="Tenure (Days) *"
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
              placeholder="Working capital for raw material purchase"
            />

            {/* Warning banner matching user mock */}
            {!isInvoiceAlreadyFinanced && (
              <Alert 
                severity="warning" 
                icon={<ShieldAlert size={20} />}
                sx={{ 
                  backgroundColor: 'rgba(237, 108, 2, 0.08)',
                  border: '1px solid rgba(237, 108, 2, 0.3)',
                  borderRadius: 2,
                  fontSize: '0.8rem'
                }}
              >
                If an invoice that is already financed is submitted again (even through a different bank account), it will be flagged and may increase the fraud/duplicate score.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color={isInvoiceAlreadyFinanced ? "error" : "primary"}
            onClick={handleCreateRequest}
            disabled={!newRequest.customerId || !newRequest.invoiceId || !newRequest.bankAccount}
          >
            {isInvoiceAlreadyFinanced ? "Submit Anyway (Will Be Flagged)" : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Bank Account Dialog */}
      <Dialog open={openBankDialog} onClose={() => setOpenBankDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Landmark size={20} color="#1976d2" />
          Add Bank Account
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Bank Name *</InputLabel>
              <Select
                value={newBankForm.selectedBank}
                label="Bank Name *"
                onChange={(e) => setNewBankForm({ ...newBankForm, selectedBank: e.target.value })}
              >
                <MenuItem value="Indian Bank">Indian Bank</MenuItem>
                <MenuItem value="SBI">SBI</MenuItem>
                <MenuItem value="HDFC">HDFC</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Account Number *"
              fullWidth
              size="small"
              value={newBankForm.accountNumber}
              onChange={(e) => setNewBankForm({ ...newBankForm, accountNumber: e.target.value })}
              placeholder="e.g. 50100492814821"
            />

            <TextField
              label="CIF Number *"
              fullWidth
              size="small"
              value={newBankForm.cifNumber}
              onChange={(e) => setNewBankForm({ ...newBankForm, cifNumber: e.target.value })}
              placeholder="e.g. CIF8829141"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenBankDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveBankAccount}
            disabled={!newBankForm.accountNumber.trim() || !newBankForm.cifNumber.trim()}
          >
            Save Bank Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Request Details Dialog */}
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
                  <Typography color="text.secondary">Bank</Typography>
                  <Typography fontWeight="500">{viewRequest.bankAccount || viewRequest.bankName || 'Indian Bank'}</Typography>
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
