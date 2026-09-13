import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Grid, InputAdornment
} from '@mui/material';
import BankIcon from '@mui/icons-material/AccountBalance';
import { getFinancingRequests, getBankApprovals, processBankApproval } from '../services/api';

const BankApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [processingFee, setProcessingFee] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both financing requests and existing approvals
      const [finRes, appRes] = await Promise.all([
        getFinancingRequests(),
        getBankApprovals()
      ]);
      
      // Filter financing requests: Bank should only see requests that are UNDER_REVIEW or APPROVED/REJECTED/DISBURSED
      // In a real app, we would only fetch requests that have a CLEARED fraud report.
      // We will handle this in UI for simplicity.
      
      setRequests(finRes.data.data);
      setApprovals(appRes.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (request) => {
    setSelectedRequest(request);
    setApprovedAmount(request.totalAmountRequested);
    setInterestRate(request.interestRate || '1.5');
    setProcessingFee('250');
    setRemarks('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleSubmit = async (status) => {
    try {
      setSubmitting(true);
      const data = {
        financingRequestId: selectedRequest.id,
        approvedAmount,
        interestRate,
        processingFee,
        status,
        remarks
      };
      await processBankApproval(data);
      handleCloseDialog();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process approval');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusChip = (status) => {
    switch(status) {
      case 'PENDING': return <Chip label="Pending" color="warning" size="small" />;
      case 'UNDER_REVIEW': return <Chip label="Under Review" color="info" size="small" />;
      case 'APPROVED': return <Chip label="Approved" color="success" size="small" />;
      case 'REJECTED': return <Chip label="Rejected" color="error" size="small" />;
      case 'DISBURSED': return <Chip label="Disbursed" color="secondary" size="small" />;
      default: return <Chip label={status} size="small" />;
    }
  };

  const renderAnalystChip = (assessment) => {
    switch(assessment) {
      case 'Safe': return <Chip label="Safe" color="success" size="small" variant="outlined" />;
      case 'Risk': return <Chip label="Risk" color="error" size="small" variant="outlined" />;
      default: return <Chip label={assessment || 'Pending'} color="warning" size="small" variant="outlined" />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>Bank Approvals</Typography>
          <Typography variant="body1" color="text.secondary">
            Review financing requests cleared by risk analysts and issue approvals.
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell>Financing Req #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Requested Amount</TableCell>
                  <TableCell>Analyst</TableCell>
                  <TableCell>Current Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      No requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.requestNumber}</TableCell>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>₹{row.totalAmountRequested?.toFixed(2)}</TableCell>
                      <TableCell>{renderAnalystChip(row.riskAssessment)}</TableCell>
                      <TableCell>{renderStatusChip(row.status)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleOpenDialog(row)}
                          disabled={['APPROVED', 'REJECTED', 'DISBURSED'].includes(row.status)}
                        >
                          {['APPROVED', 'REJECTED', 'DISBURSED'].includes(row.status) ? 'Processed' : 'Process'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Process Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedRequest && (
          <>
            <DialogTitle sx={{ backgroundColor: 'grey.50', display: 'flex', alignItems: 'center' }}>
              <BankIcon color="primary" sx={{ mr: 1 }} />
              Process Request: {selectedRequest.requestNumber}
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedRequest.customerName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Requested Amount</Typography>
                    <Typography variant="body1" fontWeight="bold">₹{selectedRequest.totalAmountRequested?.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Approved Amount"
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Interest Rate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Processing Fee"
                    type="number"
                    value={processingFee}
                    onChange={(e) => setProcessingFee(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
              <Button 
                onClick={() => handleSubmit('REJECTED')} 
                color="error" 
                variant="outlined" 
                disabled={submitting}
              >
                Reject
              </Button>
              <Button 
                onClick={() => handleSubmit('APPROVED')} 
                color="primary" 
                variant="contained" 
                disabled={submitting || !approvedAmount}
              >
                Approve
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default BankApprovals;
