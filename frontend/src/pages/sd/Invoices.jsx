import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { Download, Eye } from 'lucide-react';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('/invoices');
        setInvoices(response.data.data);
      } catch (error) {
        console.error('Failed to fetch invoices', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const downloadInvoice = (invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("INVOICE", 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 14, 32);
    doc.text(`Date: ${invoice.invoiceDate}`, 14, 40);
    doc.text(`Customer: ${invoice.customerName}`, 14, 48);
    
    doc.text(`Total Amount: Rs. ${invoice.totalAmount?.toLocaleString()}`, 14, 60);
    doc.text(`Status: ${invoice.status}`, 14, 68);
    
    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const handleOpenView = (invoice) => {
    setSelectedInvoice(invoice);
    setViewOpen(true);
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setSelectedInvoice(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PARTIALLY_PAID': return 'warning';
      case 'ISSUED': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Invoices
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>Loading...</TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>No invoices found</TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell fontWeight="500">{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.salesOrderNumber}</TableCell>
                    <TableCell>{inv.customerName}</TableCell>
                    <TableCell>{inv.invoiceDate}</TableCell>
                    <TableCell>{inv.dueDate}</TableCell>
                    <TableCell align="right">₹{inv.totalAmount?.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Chip label={inv.status} size="small" color={getStatusColor(inv.status)} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => handleOpenView(inv)}>
                        <Eye size={18} />
                      </IconButton>
                      <IconButton size="small" color="secondary" onClick={() => downloadInvoice(inv)}>
                        <Download size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={viewOpen} onClose={handleCloseView} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Invoice Details</DialogTitle>
        <DialogContent dividers>
          {selectedInvoice && (
            <Box>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Invoice Number</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedInvoice.invoiceNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedInvoice.invoiceDate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedInvoice.customerName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label={selectedInvoice.status} size="small" color={getStatusColor(selectedInvoice.status)} sx={{ mt: 0.5 }} />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" mb={2}>Financials</Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                  <Typography variant="body1" fontWeight="500" fontSize="1.1rem">₹{selectedInvoice.totalAmount?.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Amount Paid</Typography>
                  <Typography variant="body1" fontWeight="500" color="success.main">₹{selectedInvoice.amountPaid?.toLocaleString() || 0}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
          <Button onClick={() => { downloadInvoice(selectedInvoice); handleCloseView(); }} variant="contained" color="primary" startIcon={<Download size={16} />}>Download PDF</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices;
