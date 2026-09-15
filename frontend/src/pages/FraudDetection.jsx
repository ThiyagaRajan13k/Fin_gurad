import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, CircularProgress, Alert, AlertTitle, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Grid, Divider
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { getFraudReports, updateFraudDecision } from '../services/api';

const FraudDetection = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getFraudReports();
      setReports(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch fraud reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenDialog = (report) => {
    setSelectedReport(report);
    setRemarks(report.analystRemarks || '');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReport(null);
  };

  const handleSubmitDecision = async (decision) => {
    if (!remarks.trim()) {
      alert("Remarks are mandatory when submitting a decision.");
      return;
    }
    try {
      setSubmitting(true);
      await updateFraudDecision(selectedReport.id, decision, remarks);
      handleCloseDialog();
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update decision');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score === 0) return 'success.main';
    if (score < 40) return 'warning.main';
    return 'error.main';
  };

  const renderStatusChip = (status) => {
    switch(status) {
      case 'PENDING_REVIEW': return <Chip label="Pending Review" color="warning" size="small" />;
      case 'CLEARED': return <Chip label="Cleared (Safe)" color="success" size="small" />;
      case 'FLAGGED': return <Chip label="Flagged (Fraud)" color="error" size="small" />;
      default: return <Chip label={status} size="small" />;
    }
  };

  const VerificationItem = ({ label, passed }) => (
    <Grid item xs={6} md={4} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {passed ? (
        <CheckCircleIcon color="success" sx={{ mr: 1 }} fontSize="small" />
      ) : (
        <ErrorIcon color="error" sx={{ mr: 1 }} fontSize="small" />
      )}
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: !passed ? 'bold' : 'normal',
          color: !passed ? 'error.main' : 'text.primary' 
        }}
      >
        {label} {!passed && '(FLAGGED)'}
      </Typography>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <ShieldIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>Fraud Detection</Typography>
          <Typography variant="body1" color="text.secondary">
            Review automatically generated fraud reports and override system recommendations.
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
                  <TableCell>Report #</TableCell>
                  <TableCell>Financing Req #</TableCell>
                  <TableCell>Bank Account</TableCell>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>System Rec.</TableCell>
                  <TableCell>Fraud Score</TableCell>
                  <TableCell>Analyst Decision</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      No fraud reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.reportNumber}</TableCell>
                      <TableCell>{row.financingRequestNumber}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <AccountBalanceIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {row.bankAccount || row.bankName || '—'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.invoiceNumber || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.systemRecommendation} 
                          color={row.systemRecommendation === 'SAFE' ? 'success' : row.systemRecommendation === 'SUSPICIOUS' ? 'warning' : 'error'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: getScoreColor(row.fraudScore), fontWeight: 'bold' }}>
                          {row.fraudScore} / 100
                        </Typography>
                      </TableCell>
                      <TableCell>{renderStatusChip(row.analystDecision)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleOpenDialog(row)}
                        >
                          Review
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

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedReport && (
          <>
            <DialogTitle sx={{ backgroundColor: 'grey.50', display: 'flex', alignItems: 'center' }}>
              <ShieldIcon color="primary" sx={{ mr: 1 }} />
              Review Fraud Report: {selectedReport.reportNumber}
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>System Analysis</Typography>
                <Grid container spacing={2} sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">Financing Request</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedReport.financingRequestNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">Bank Account</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccountBalanceIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedReport.bankAccount || selectedReport.bankName || 'Not specified'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">Invoice Number</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedReport.invoiceNumber || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                    <Typography variant="body1">
                      {selectedReport.customerName || 'Acme Corporation'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">System Rec.</Typography>
                    <Chip 
                      label={selectedReport.systemRecommendation} 
                      color={selectedReport.systemRecommendation === 'SAFE' ? 'success' : selectedReport.systemRecommendation === 'SUSPICIOUS' ? 'warning' : 'error'} 
                      size="small" 
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">Fraud Score</Typography>
                    <Typography variant="h6" sx={{ color: getScoreColor(selectedReport.fraudScore), fontWeight: 'bold' }}>
                      {selectedReport.fraudScore} / 100
                    </Typography>
                  </Grid>
                </Grid>

                {/* Prominent Duplicate / Cross-Bank Fraud Banner */}
                {(selectedReport.duplicateFinancing || selectedReport.crossBankAttempt || selectedReport.flaggedReason) && (
                  <Alert 
                    severity="error" 
                    icon={<ErrorIcon fontSize="large" />} 
                    sx={{ 
                      mt: 2, 
                      border: '2px solid #d32f2f', 
                      bgcolor: '#fff5f5', 
                      borderRadius: 2,
                      '& .MuiAlert-message': { width: '100%' }
                    }}
                  >
                    <AlertTitle sx={{ fontWeight: 'bold', color: '#b71c1c', fontSize: '1rem' }}>
                      🚨 {selectedReport.crossBankAttempt ? 'CROSS-BANK FRAUD FLAGGED' : 'DUPLICATE FINANCING FLAGGED'}
                    </AlertTitle>
                    <Typography variant="body2" sx={{ color: '#b71c1c', fontWeight: 600, mt: 0.5 }}>
                      {selectedReport.flaggedReason || `This invoice (${selectedReport.invoiceNumber}) was detected as duplicate / cross-bank financing across accounts.`}
                    </Typography>
                    <Box sx={{ mt: 1, p: 1, bgcolor: '#ffffff', borderRadius: 1, border: '1px dashed #ef9a9a' }}>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        • <strong>Target Bank Account for this request:</strong> {selectedReport.bankAccount || selectedReport.bankName || 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        • <strong>Invoice Number:</strong> {selectedReport.invoiceNumber || 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: '#d32f2f', fontWeight: 600 }}>
                        • <strong>Status:</strong> Automatically flagged and assigned high-risk penalty score.
                      </Typography>
                    </Box>
                  </Alert>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Verification Checklist</Typography>
                <Grid container>
                  <VerificationItem label="Customer Verified" passed={selectedReport.customerVerified} />
                  <VerificationItem label="Sales Order Verified" passed={selectedReport.salesOrderVerified} />
                  <VerificationItem label="Shipment Verified" passed={selectedReport.shipmentVerified} />
                  <VerificationItem label="Invoice Verified" passed={selectedReport.invoiceVerified} />
                  <VerificationItem label="Amount Matched" passed={selectedReport.amountMatched} />
                  <VerificationItem label="Duplicate Invoice" passed={!selectedReport.duplicateInvoice} />
                  <VerificationItem label="Duplicate Financing" passed={!selectedReport.duplicateFinancing} />
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="h6" gutterBottom>Analyst Override</Typography>
                {selectedReport.analystDecision !== 'PENDING_REVIEW' && (
                  <Alert severity={selectedReport.analystDecision === 'FLAGGED' ? 'error' : 'info'} sx={{ mb: 2 }}>
                    Currently marked as <strong>{selectedReport.analystDecision}</strong> {selectedReport.analystName ? `by ${selectedReport.analystName}` : '(Automated Engine Detection)'}
                  </Alert>
                )}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Analyst Remarks (Mandatory)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
              <Button 
                onClick={() => handleSubmitDecision('FLAGGED')} 
                color="error" 
                variant="contained" 
                disabled={submitting || !remarks.trim()}
              >
                Flag as Fraud
              </Button>
              <Button 
                onClick={() => handleSubmitDecision('CLEARED')} 
                color="success" 
                variant="contained" 
                disabled={submitting || !remarks.trim()}
              >
                Clear (Safe)
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default FraudDetection;
