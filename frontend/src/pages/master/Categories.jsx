import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Edit } from 'lucide-react';
import { getCategories, updateCategory } from '../../services/categoryService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState({ id: null, name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleEditClick = (cat) => {
    setEditingCategory({ id: cat.id, name: cat.name, description: cat.description });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory({ id: null, name: '', description: '' });
  };

  const handleChange = (e) => {
    setEditingCategory({ ...editingCategory, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateCategory(editingCategory.id, { name: editingCategory.name, description: editingCategory.description });
      fetchCategories();
      handleClose();
    } catch (error) {
      console.error("Failed to update category", error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Category Master</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} hover>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => handleEditClick(category)}>
                    <Edit size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>No categories found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Category Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <TextField 
              label="Name" 
              name="name" 
              value={editingCategory.name} 
              onChange={handleChange} 
              fullWidth 
            />
            <TextField 
              label="Description" 
              name="description" 
              value={editingCategory.description} 
              onChange={handleChange} 
              fullWidth 
              multiline 
              rows={3} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!editingCategory.name}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
