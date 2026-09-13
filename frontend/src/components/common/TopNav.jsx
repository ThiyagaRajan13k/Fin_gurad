import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { Bell, Search, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const TopNav = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)', // Glassmorphism
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        color: 'text.primary',
        height: '88px'
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', px: { xs: 2, sm: 4 }, minHeight: '88px' }}>
        <Box display="flex" flexDirection="row" alignItems="center" gap={2} flexWrap="nowrap">
          
          <Box display="flex" flexDirection="row" alignItems="center" gap={2} flexWrap="nowrap" onClick={handleMenuOpen} sx={{ cursor: 'pointer', p: 0.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, flexShrink: 0 }}>
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <Box textAlign="left" display={{ xs: 'none', md: 'block' }}>
              <Typography variant="subtitle2" fontWeight="600" lineHeight={1.2} noWrap>{user?.fullName}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{user?.role.replace('ROLE_', '').replace('_', ' ')}</Typography>
            </Box>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.1))',
                mt: 1.5,
                borderRadius: 2,
                minWidth: 200
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleMenuClose}>
              <UserIcon size={18} style={{ marginRight: 12 }} /> Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogOut size={18} style={{ marginRight: 12 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
