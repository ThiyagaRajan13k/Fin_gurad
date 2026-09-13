import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid } from '@mui/material';
import { Plus } from 'lucide-react';
import { getProducts, createProduct } from '../../services/productService';
import { getCategories } from '../../services/categoryService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    categoryName: '',
    price: '',
    gstPercentage: '',
    unit: 'PCS',
    productCode: '',
    description: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prodRes);
      // Ensure category response is handled if it's direct array or wrapped in data
      setCategories(Array.isArray(catRes) ? catRes : (catRes.data || []));
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewProduct({ name: '', categoryName: '', price: '', gstPercentage: '', unit: 'PCS', productCode: '', description: '', status: 'ACTIVE' });
  };

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await createProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        gstPercentage: parseFloat(newProduct.gstPercentage)
      });
      fetchData();
      handleClose();
    } catch (error) {
      console.error("Failed to create product", error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Product Master</Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={handleOpen}>
          New Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>GST %</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>
                  <Chip label={product.productCode} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <Chip label={product.categoryName} size="small" color="secondary" variant="outlined" />
                </TableCell>
                <TableCell>₹{product.price}</TableCell>
                <TableCell>{product.gstPercentage}%</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>
                  <Chip 
                    label={product.status} 
                    size="small" 
                    color={product.status === 'ACTIVE' ? 'success' : 'default'} 
                  />
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No products found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Product Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Product</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Product Code" name="productCode" value={newProduct.productCode} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Product Name" name="name" value={newProduct.name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Category" name="categoryName" value={newProduct.categoryName} onChange={handleChange} fullWidth required placeholder="Enter category name" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Unit" name="unit" value={newProduct.unit} onChange={handleChange} fullWidth required>
                <MenuItem value="PCS">PCS (Pieces)</MenuItem>
                <MenuItem value="KG">KG (Kilograms)</MenuItem>
                <MenuItem value="BOX">BOX (Boxes)</MenuItem>
                <MenuItem value="MTR">MTR (Meters)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Price (₹)" name="price" type="number" value={newProduct.price} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="GST %" name="gstPercentage" type="number" value={newProduct.gstPercentage} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" name="description" value={newProduct.description} onChange={handleChange} fullWidth multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!newProduct.name || !newProduct.categoryName || !newProduct.price || !newProduct.productCode}
          >
            Create Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
