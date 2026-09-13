import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Autocomplete, Grid, Divider } from '@mui/material';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { getSalesOrders, createSalesOrder, getCustomers, getProducts } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const SalesOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [newOrder, setNewOrder] = useState({
    customerId: null,
    items: [{ productId: null, quantity: 1 }],
    remarks: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchFormData();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getSalesOrders();
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([getCustomers(), getProducts()]);
      if (Array.isArray(custRes.data)) setCustomers(custRes.data);
      else if (custRes.data.success) setCustomers(custRes.data.data);
      
      if (Array.isArray(prodRes.data)) setProducts(prodRes.data);
      else if (prodRes.data.success) setProducts(prodRes.data.data);
    } catch (error) {
      console.error("Failed to fetch form data", error);
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewOrder({ customerId: null, items: [{ productId: null, quantity: 1 }], remarks: '' });
  };

  const handleCustomerChange = (event, newValue) => {
    setNewOrder({ ...newOrder, customerId: newValue ? newValue.id : null });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index][field] = value;
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const handleAddItem = () => {
    setNewOrder({ ...newOrder, items: [...newOrder.items, { productId: null, quantity: 1 }] });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...newOrder.items];
    updatedItems.splice(index, 1);
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        customerId: newOrder.customerId,
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        discount: 0,
        remarks: newOrder.remarks,
        items: newOrder.items.filter(item => item.productId).map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discount: 0
        }))
      };
      
      const response = await createSalesOrder(orderData);
      if (response.data.success) {
        fetchOrders();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Failed to create order", error);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">Sales Orders</Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>Manage customer orders and distribution.</Typography>
        </Box>
        {user?.role === 'ROLE_SUPPLIER' && (
          <Button variant="contained" startIcon={<Plus size={20} />} onClick={handleOpenDialog}>
            New Order
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell fontWeight="500">{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.orderDate}</TableCell>
                <TableCell align="right">₹{order.totalAmount?.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip label={order.status} size="small" color={order.status === 'DELIVERED' ? 'success' : order.status === 'SHIPPED' ? 'info' : 'warning'} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary">
                    <Eye size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No sales orders found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Order Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New Sales Order</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => option.name}
              value={customers.find(c => c.id === newOrder.customerId) || null}
              onChange={handleCustomerChange}
              renderInput={(params) => <TextField {...params} label="Customer (Type to search)" fullWidth />}
            />

            <Box>
              <Typography variant="h6" mb={2}>Products</Typography>
              {newOrder.items.map((item, index) => (
                <Grid container spacing={2} alignItems="center" mb={2} key={index}>
                  <Grid item xs={12} sm={7}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(option) => option.name}
                      value={products.find(p => p.id === item.productId) || null}
                      onChange={(e, newValue) => handleItemChange(index, 'productId', newValue ? newValue.id : null)}
                      renderInput={(params) => <TextField {...params} label="Select Product" />}
                    />
                  </Grid>
                  <Grid item xs={8} sm={3}>
                    <TextField 
                      label="Qty" 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} 
                      fullWidth 
                    />
                  </Grid>
                  <Grid item xs={4} sm={2} textAlign="center">
                    <IconButton color="error" onClick={() => handleRemoveItem(index)} disabled={newOrder.items.length === 1}>
                      <Trash2 size={20} />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button variant="outlined" startIcon={<Plus size={16} />} onClick={handleAddItem} sx={{ mt: 1 }}>
                Add Another Product
              </Button>
            </Box>

            <Divider />

            <TextField 
              label="Remarks / Notes" 
              value={newOrder.remarks} 
              onChange={(e) => setNewOrder({...newOrder, remarks: e.target.value})} 
              fullWidth 
              multiline 
              rows={2} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateOrder} 
            variant="contained" 
            disabled={!newOrder.customerId || newOrder.items.some(i => !i.productId)}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesOrders;
