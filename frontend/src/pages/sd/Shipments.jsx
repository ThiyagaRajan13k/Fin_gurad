import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import { Truck, Check, X } from 'lucide-react';
import { getShipments, updateShipmentStatus } from '../../services/api';
import { motion } from 'framer-motion';

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await getShipments();
      if (response.data.success) {
        setShipments(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateShipmentStatus(id, newStatus);
      fetchShipments();
    } catch (error) {
      console.error('Failed to update shipment status', error);
      alert('Failed to update shipment status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PROCESSING': return 'warning';
      case 'IN_TRANSIT': return 'info';
      case 'DELIVERED': return 'success';
      case 'RETURNED': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">Shipments</Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>Track and manage outbound deliveries.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Truck size={20} />}>
          New Shipment
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tracking #</TableCell>
              <TableCell>Order #</TableCell>
              <TableCell>Carrier</TableCell>
              <TableCell>Est. Delivery</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shipments.map((shipment) => (
              <TableRow key={shipment.id} hover>
                <TableCell fontWeight="500">{shipment.trackingNumber}</TableCell>
                <TableCell>{shipment.salesOrderNumber}</TableCell>
                <TableCell>{shipment.carrierName}</TableCell>
                <TableCell>{new Date(shipment.estimatedDelivery).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip label={shipment.status.replace('_', ' ')} color={getStatusColor(shipment.status)} size="small" sx={{ fontWeight: 600 }} />
                </TableCell>
                <TableCell align="right">
                  {shipment.status === 'CREATED' ? (
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success" 
                        onClick={() => handleStatusUpdate(shipment.id, 'DISPATCHED')}
                        startIcon={<Check size={16} />}
                        sx={{ borderRadius: 2 }}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="error" 
                        onClick={() => handleStatusUpdate(shipment.id, 'RETURNED')}
                        startIcon={<X size={16} />}
                        sx={{ borderRadius: 2 }}
                      >
                        Decline
                      </Button>
                    </Box>
                  ) : (
                    <Button size="small" variant="outlined" sx={{ borderRadius: 2 }} disabled>Processed</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {shipments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No shipments found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Shipments;
