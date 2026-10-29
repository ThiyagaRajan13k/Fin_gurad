import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Chip, Button, IconButton, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Autocomplete, Grid, Divider, 
  Alert, AlertTitle 
} from '@mui/material';
import { Plus, Eye, Edit, Trash2, AlertTriangle, PackageX } from 'lucide-react';
import { getSalesOrders, createSalesOrder, getCustomers, getProducts } from '../../services/api';
import { getAllInventory } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { motion } from 'framer-motion';

const SalesOrders = () => {
  const { user } = useAuth();
  const { refreshAlerts } = useNotifications();
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
      const [custRes, prodRes, invRes] = await Promise.all([
        getCustomers(),
        getProducts(),
        getAllInventory().catch(() => [])
      ]);

      if (Array.isArray(custRes.data)) setCustomers(custRes.data);
      else if (custRes.data?.success) setCustomers(custRes.data.data);

      let rawProds = [];
      if (Array.isArray(prodRes.data)) rawProds = prodRes.data;
      else if (prodRes.data?.success) rawProds = prodRes.data.data;

      const invList = Array.isArray(invRes) ? invRes : (Array.isArray(invRes?.data) ? invRes.data : []);

      const mergedProducts = rawProds.map(prod => {
        const inv = invList.find(i => 
          (i.productId && Number(i.productId) === Number(prod.id)) ||
          (i.productCode && prod.productCode && i.productCode.toLowerCase() === prod.productCode.toLowerCase()) ||
          (i.productName && prod.name && i.productName.toLowerCase() === prod.name.toLowerCase())
        );

        let stock = 100; // Default fallback if not tracked
        if (inv && inv.availableStock !== undefined && inv.availableStock !== null) {
          stock = Number(inv.availableStock);
        } else if (prod.availableStock !== undefined && prod.availableStock !== null) {
          stock = Number(prod.availableStock);
        }

        return {
          ...prod,
          availableStock: stock
        };
      });

      setProducts(mergedProducts);
    } catch (error) {
      console.error("Failed to fetch form data", error);
    }
  };

  const handleOpenDialog = () => {
    fetchFormData(); // Ensure freshest stock levels when opening dialog
    setOpenDialog(true);
  };

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
    // Validate out of stock items
    for (const item of newOrder.items) {
      if (!item.productId) continue;
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const availableStock = (product.availableStock !== undefined && product.availableStock !== null)
          ? Number(product.availableStock)
          : 100;
        if (availableStock <= 0) {
          alert(`Product '${product.name}' is OUT OF STOCK (0 available) and cannot be ordered.`);
          return;
        }
        if (item.quantity > availableStock) {
          alert(`Insufficient stock for '${product.name}'. Available: ${availableStock}, Requested: ${item.quantity}.`);
          return;
        }
      }
    }

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
      if (response.data && (response.data.success || response.status === 200)) {
        await Promise.all([fetchOrders(), fetchFormData(), refreshAlerts()]);
        handleCloseDialog();
      } else {
        const msg = response.data?.message || 'Failed to create sales order';
        alert('Order creation failed: ' + msg);
      }
    } catch (error) {
      console.error("Failed to create order", error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to create order';
      alert('Error creating order: ' + errMsg);
    }
  };

  // Check if any product in form is invalid due to stock
  const hasOutOfStockSelection = newOrder.items.some(item => {
    if (!item.productId) return false;
    const prod = products.find(p => p.id === item.productId);
    if (!prod) return false;
    const stock = (prod.availableStock !== undefined && prod.availableStock !== null)
      ? Number(prod.availableStock)
      : 100;
    return stock <= 0 || item.quantity > stock;
  });

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
              <TableCell align="right">Amount</TableCell>
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
            
            {/* Out of Stock Advisory if any inventory item has 0 stock */}
            {products.some(p => p.availableStock !== undefined && p.availableStock !== null && p.availableStock <= 0) && (
              <Alert severity="warning" icon={<PackageX size={20} />} sx={{ borderRadius: 2 }}>
                <strong>Stock Notice:</strong> Some products are currently <strong>Out of Stock</strong> (0 units available) and cannot be added to orders until inventory is replenished.
              </Alert>
            )}

            <Autocomplete
              options={customers}
              getOptionLabel={(option) => option.name}
              value={customers.find(c => c.id === newOrder.customerId) || null}
              onChange={handleCustomerChange}
              renderInput={(params) => <TextField {...params} label="Customer (Type to search)" fullWidth />}
            />

            <Box>
              <Typography variant="h6" mb={2}>Products</Typography>
              {newOrder.items.map((item, index) => {
                const selectedProd = products.find(p => p.id === item.productId);
                const prodStock = selectedProd && (selectedProd.availableStock !== undefined && selectedProd.availableStock !== null)
                  ? Number(selectedProd.availableStock)
                  : 100;
                const isOos = selectedProd && prodStock <= 0;
                const isOverStock = selectedProd && prodStock > 0 && item.quantity > prodStock;

                return (
                  <Box key={index} mb={2} p={1.5} sx={{ border: isOos ? '1px solid #d32f2f' : '1px solid rgba(0,0,0,0.06)', borderRadius: 2, bgcolor: isOos ? 'rgba(211,47,47,0.02)' : 'transparent' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={7}>
                        <Autocomplete
                          options={products}
                          getOptionLabel={(option) => {
                            if (!option.name) return '';
                            const stock = (option.availableStock !== undefined && option.availableStock !== null) ? Number(option.availableStock) : 100;
                            return `${option.name} (₹${option.price}) - ${stock <= 0 ? 'OUT OF STOCK' : `${stock} in stock`}`;
                          }}
                          getOptionDisabled={(option) => option.availableStock !== undefined && option.availableStock !== null && option.availableStock <= 0}
                          isOptionEqualToValue={(option, val) => option.id === val.id}
                          value={selectedProd || null}
                          onChange={(e, newValue) => {
                            if (newValue && newValue.availableStock !== undefined && newValue.availableStock !== null && newValue.availableStock <= 0) {
                              alert(`'${newValue.name}' is OUT OF STOCK (0 available) and cannot be added to an order.`);
                              return;
                            }
                            handleItemChange(index, 'productId', newValue ? newValue.id : null);
                          }}
                          renderOption={(props, option) => {
                            const stock = (option.availableStock !== undefined && option.availableStock !== null) ? Number(option.availableStock) : 100;
                            const optionOos = stock <= 0;
                            return (
                              <li {...props} key={option.id} style={{ opacity: optionOos ? 0.6 : 1 }}>
                                <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                                  <span>{option.name} (₹{option.price})</span>
                                  <Chip 
                                    label={optionOos ? 'Out of Stock' : `${stock} in stock`} 
                                    size="small" 
                                    color={optionOos ? 'error' : stock <= 10 ? 'warning' : 'success'}
                                    sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                  />
                                </Box>
                              </li>
                            );
                          }}
                          renderInput={(params) => <TextField {...params} label="Select Product" fullWidth />}
                        />
                      </Grid>
                      <Grid item xs={8} sm={3}>
                        <TextField 
                          label="Qty" 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} 
                          inputProps={{ min: 1, max: selectedProd ? prodStock : undefined }}
                          fullWidth 
                        />
                      </Grid>
                      <Grid item xs={4} sm={2} textAlign="center">
                        <IconButton color="error" onClick={() => handleRemoveItem(index)} disabled={newOrder.items.length === 1}>
                          <Trash2 size={20} />
                        </IconButton>
                      </Grid>
                    </Grid>

                    {/* In-place warning if product is out of stock */}
                    {isOos && (
                      <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>
                        <strong>Out of Stock:</strong> '{selectedProd.name}' has 0 available units and cannot be ordered. Please remove this product or replenish inventory.
                      </Alert>
                    )}

                    {/* Warning if requested quantity exceeds available stock */}
                    {isOverStock && (
                      <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
                        <strong>Quantity Warning:</strong> Only {prodStock} units available for '{selectedProd.name}'!
                      </Alert>
                    )}
                  </Box>
                );
              })}
              
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
            disabled={!newOrder.customerId || newOrder.items.some(i => !i.productId) || hasOutOfStockSelection}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesOrders;
