import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Divider, Badge, Chip, Button } from '@mui/material';
import { Bell, Search, LogOut, User as UserIcon, AlertTriangle, PackageX, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 280;

const TopNav = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, readIds, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleGoToInventory = (notifId) => {
    if (notifId) markAsRead(notifId);
    handleNotifClose();
    navigate('/inventory');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        color: 'text.primary',
        height: '88px'
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', px: { xs: 2, sm: 4 }, minHeight: '88px' }}>
        <Box display="flex" flexDirection="row" alignItems="center" gap={2} flexWrap="nowrap">
          
          {/* Notification Bell with Badge */}
          <IconButton 
            onClick={handleNotifOpen} 
            sx={{ 
              p: 1.2, 
              borderRadius: 2, 
              border: unreadCount > 0 ? '1px solid rgba(211, 47, 47, 0.2)' : '1px solid rgba(0,0,0,0.06)',
              backgroundColor: unreadCount > 0 ? 'rgba(211, 47, 47, 0.05)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } 
            }}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <Bell size={20} color={unreadCount > 0 ? '#d32f2f' : '#555'} />
            </Badge>
          </IconButton>

          {/* Notifications Dropdown Menu */}
          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            PaperProps={{
              elevation: 4,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.12))',
                mt: 1.5,
                borderRadius: 3,
                width: 380,
                maxHeight: 480,
                p: 0
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center" bgcolor="grey.50" borderBottom="1px solid rgba(0,0,0,0.06)">
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
                {unreadCount > 0 && (
                  <Chip label={`${unreadCount} New`} size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
                )}
              </Box>
              {unreadCount > 0 && (
                <Button size="small" onClick={markAllAsRead} sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
                  Mark all as read
                </Button>
              )}
            </Box>

            <Box sx={{ maxHeight: 340, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <Box p={3} textAlign="center">
                  <CheckCircle size={32} color="#2e7d32" style={{ margin: '0 auto 8px' }} />
                  <Typography variant="body2" color="text.secondary">All products are healthy in stock!</Typography>
                </Box>
              ) : (
                notifications.map((notif) => {
                  const isRead = readIds.includes(notif.id);
                  const isOos = notif.type === 'OUT_OF_STOCK';

                  return (
                    <Box
                      key={notif.id}
                      p={2}
                      sx={{
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        backgroundColor: !isRead ? (isOos ? 'rgba(211, 47, 47, 0.04)' : 'rgba(237, 108, 2, 0.04)') : 'transparent',
                        transition: 'background-color 0.2s',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' }
                      }}
                    >
                      <Box display="flex" alignItems="flex-start" gap={1.5}>
                        {isOos ? (
                          <PackageX size={20} color="#d32f2f" style={{ marginTop: 2, flexShrink: 0 }} />
                        ) : (
                          <AlertTriangle size={20} color="#ed6c02" style={{ marginTop: 2, flexShrink: 0 }} />
                        )}
                        <Box flex={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" fontWeight="bold" color={isOos ? 'error.main' : 'warning.main'}>
                              {notif.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{notif.timestamp}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.82rem', color: 'text.primary' }}>
                            {notif.message}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                            <Chip 
                              label={isOos ? '0 Available (Blocked from Orders)' : `${notif.availableStock} remaining`} 
                              size="small" 
                              color={isOos ? 'error' : 'warning'}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            <Button 
                              size="small" 
                              endIcon={<ArrowRight size={14} />} 
                              onClick={() => handleGoToInventory(notif.id)}
                              sx={{ fontSize: '0.75rem', textTransform: 'none', p: 0 }}
                            >
                              Go to Inventory
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>

            <Divider />
            <Box p={1.5} textAlign="center" bgcolor="grey.50">
              <Button fullWidth size="small" onClick={() => handleGoToInventory()} sx={{ textTransform: 'none', fontWeight: 600 }}>
                View All Inventory & Stock Levels
              </Button>
            </Box>
          </Menu>

          {/* User Profile */}
          <Box display="flex" flexDirection="row" alignItems="center" gap={2} flexWrap="nowrap" onClick={handleMenuOpen} sx={{ cursor: 'pointer', p: 0.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, flexShrink: 0 }}>
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <Box textAlign="left" display={{ xs: 'none', md: 'block' }}>
              <Typography variant="subtitle2" fontWeight="600" lineHeight={1.2} noWrap>{user?.fullName}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{user?.role?.replace('ROLE_', '').replace('_', ' ')}</Typography>
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
