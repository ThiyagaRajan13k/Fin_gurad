import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { LayoutDashboard, Users, ShieldAlert, Building2, Package, ListTree, Users2, Box as BoxIcon, FileText, DollarSign, Landmark, ShieldCheck, Settings, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_SUPPLIER', 'ROLE_FRAUD_ANALYST', 'ROLE_BANK_OFFICER', 'ROLE_RISK_ANALYST'] },
    { text: 'User Management', icon: <Users size={20} />, path: '/users', roles: ['ROLE_ADMIN'] },
    { text: 'Role Management', icon: <ShieldCheck size={20} />, path: '/roles', roles: ['ROLE_ADMIN'] },
    { text: 'System Settings', icon: <Settings size={20} />, path: '/settings', roles: ['ROLE_ADMIN'] },
    { text: 'Audit Logs', icon: <Clock size={20} />, path: '/audit', roles: ['ROLE_ADMIN'] },
    { text: 'Reports', icon: <FileText size={20} />, path: '/reports', roles: ['ROLE_ADMIN', 'ROLE_BANK_OFFICER'] },
    { text: 'Customers', icon: <Users2 size={20} />, path: '/customers', roles: ['ROLE_BANK_OFFICER', 'ROLE_SUPPLIER'] },
    { text: 'Categories', icon: <ListTree size={20} />, path: '/categories', roles: ['ROLE_SUPPLIER'] },
    { text: 'Products', icon: <Package size={20} />, path: '/products', roles: ['ROLE_SUPPLIER'] },
    { text: 'Inventory', icon: <BoxIcon size={20} />, path: '/inventory', roles: ['ROLE_SUPPLIER'] },
    { text: 'Sales Orders', icon: <Building2 size={20} />, path: '/sales-orders', roles: ['ROLE_SUPPLIER'] },
    { text: 'Shipments', icon: <Package size={20} />, path: '/shipments', roles: ['ROLE_SUPPLIER'] },
    { text: 'Invoices', icon: <FileText size={20} />, path: '/invoices', roles: ['ROLE_SUPPLIER', 'ROLE_BANK_OFFICER'] },
    { text: 'Financing', icon: <DollarSign size={20} />, path: '/financing', roles: ['ROLE_SUPPLIER', 'ROLE_BANK_OFFICER', 'ROLE_RISK_ANALYST'] },
    { text: 'Fraud Detection', icon: <ShieldAlert size={20} />, path: '/fraud', roles: ['ROLE_FRAUD_ANALYST', 'ROLE_RISK_ANALYST'] },
    { text: 'Bank Approvals', icon: <Landmark size={20} />, path: '/bank-approvals', roles: ['ROLE_BANK_OFFICER'] }
  ];

  const allowedMenus = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundColor: 'primary.dark',
          color: '#fff',
          borderRight: 'none'
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" fontWeight="bold" color="white">FG</Typography>
        </Box>
        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>FinGuard</Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ overflow: 'auto', mt: 2, px: 2 }}>
        <List>
          {allowedMenus.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItem 
                button 
                key={item.text} 
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: isActive ? '#fff' : '#9CA3AF',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    color: '#fff'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
