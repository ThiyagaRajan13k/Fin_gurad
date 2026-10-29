import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, Alert, AlertTitle 
} from '@mui/material';
import { Plus, PackageX, AlertTriangle } from 'lucide-react';
import { getAllInventory, syncInventory, adjustStock } from '../../services/inventoryService';
import { useNotifications } from '../../context/NotificationContext';

const Inventory = () => {
  const { refreshAlerts } = useNotifications();
  const [inventory, setInventory] = useState([]);
  const [addStockDialog, setAddStockDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [amountToAdd, setAmountToAdd] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      await syncInventory(); // Sync first to capture missing products
      const data = await getAllInventory();
      setInventory(data);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    }
  };

  const getStockStatus = (item) => {
    if (item.availableStock <= 0) return { label: 'Out of Stock', color: 'error' };
    if (item.availableStock <= item.lowStockAlertLevel) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  const handleOpenAddStock = (item) => {
    setSelectedItem(item);
    setAmountToAdd('');
    setAddStockDialog(true);
  };

  const handleConfirmAddStock = async () => {
    if (!amountToAdd || isNaN(amountToAdd) || Number(amountToAdd) <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }
    try {
      await adjustStock(selectedItem.productId, Number(amountToAdd));
      setAddStockDialog(false);
      await Promise.all([fetchInventory(), refreshAlerts()]);
    } catch (error) {
      console.error("Failed to add stock", error);
      alert("Failed to add stock: " + error.response?.data?.message || error.message);
    }
  };

  const outOfStockItems = inventory.filter(i => i.availableStock <= 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Inventory Management</Typography>
      </Box>

      {/* Prominent in-app notification when product reaches Out of Stock */}
      {outOfStockItems.length > 0 && (
        <Alert 
          severity="error" 
          icon={<PackageX size={24} color="#d32f2f" />}
          sx={{ 
            mb: 3, 
            borderRadius: 2, 
            border: '2px solid #d32f2f', 
            bgcolor: '#fff5f5' 
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold', color: '#b71c1c' }}>
            🚨 OUT OF STOCK ALERT ({outOfStockItems.length} Product{outOfStockItems.length > 1 ? 's' : ''})
          </AlertTitle>
          The following product(s) have reached <strong>0 available stock</strong>: <strong>{outOfStockItems.map(i => `${i.productName} (${i.productCode})`).join(', ')}</strong>.
          Suppliers are blocked from adding these products to new sales orders until stock is replenished.
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Code</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Available Stock</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Alert Level</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Stock Level</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => {
              const status = getStockStatus(item);
              const maxStock = Math.max(item.availableStock * 2, 100);
              const progress = (item.availableStock / maxStock) * 100;
              
              return (
                <TableRow key={item.id} hover sx={{ bgcolor: item.availableStock <= 0 ? 'rgba(211, 47, 47, 0.02)' : 'inherit' }}>
                  <TableCell>
                    <Chip label={item.productCode} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{item.productName}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: item.availableStock <= 0 ? 'error.main' : 'inherit' }}>
                    {item.availableStock}
                  </TableCell>
                  <TableCell>{item.lowStockAlertLevel}</TableCell>
                  <TableCell>
                    <Chip label={status.label} size="small" color={status.color} />
                  </TableCell>
                  <TableCell>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(progress, 100)} 
                      color={status.color}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => handleOpenAddStock(item)} title="Add Stock">
                      <Plus size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No inventory records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={addStockDialog} onClose={() => setAddStockDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Stock</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Typography variant="body1" mb={2}>
              Adding stock for: <strong>{selectedItem?.productName}</strong> ({selectedItem?.productCode})
            </Typography>
            <TextField
              fullWidth
              label="Amount to Add"
              type="number"
              value={amountToAdd}
              onChange={(e) => setAmountToAdd(e.target.value)}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddStockDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmAddStock} disabled={!amountToAdd || Number(amountToAdd) <= 0}>
            Add Stock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
