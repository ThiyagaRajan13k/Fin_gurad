$baseDir = "frontend\src"

New-Item -Path "$baseDir\theme" -ItemType Directory -Force | Out-Null
New-Item -Path "$baseDir\context" -ItemType Directory -Force | Out-Null
New-Item -Path "$baseDir\services" -ItemType Directory -Force | Out-Null
New-Item -Path "$baseDir\layouts" -ItemType Directory -Force | Out-Null
New-Item -Path "$baseDir\components\common" -ItemType Directory -Force | Out-Null
New-Item -Path "$baseDir\pages" -ItemType Directory -Force | Out-Null
New-Item -Path "$baseDir\routes" -ItemType Directory -Force | Out-Null

$theme = @"
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0A192F', // Deep corporate blue
      light: '#172A45',
      dark: '#020C1B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2563EB', // Vivid accent blue
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F3F4F6', // Light gray for app background
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        }
      }
    }
  },
});
"@
Set-Content -Path "$baseDir\theme\index.js" -Value $theme

$api = @"
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = \`Bearer \`${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
"@
Set-Content -Path "$baseDir\services\api.js" -Value $api

$authContext = @"
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, username: resUsername, role, fullName } = response.data;
    
    const userData = { username: resUsername, role, fullName };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
"@
Set-Content -Path "$baseDir\context\AuthContext.jsx" -Value $authContext

$protectedRoute = @"
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
"@
Set-Content -Path "$baseDir\routes\ProtectedRoute.jsx" -Value $protectedRoute

$sidebar = @"
import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { LayoutDashboard, Users, ShieldAlert, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_SUPPLIER', 'ROLE_FRAUD_ANALYST', 'ROLE_BANK_OFFICER'] },
    { text: 'Supplier Management', icon: <Building2 size={20} />, path: '/suppliers', roles: ['ROLE_ADMIN', 'ROLE_BANK_OFFICER'] },
    { text: 'Fraud Detection', icon: <ShieldAlert size={20} />, path: '/fraud', roles: ['ROLE_ADMIN', 'ROLE_FRAUD_ANALYST'] },
    { text: 'User Management', icon: <Users size={20} />, path: '/users', roles: ['ROLE_ADMIN'] },
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
          backgroundColor: '#0A192F', // Matches primary main
          color: '#fff',
          borderRight: 'none'
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                  color: isActive ? '#3B82F6' : '#9CA3AF',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
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
"@
Set-Content -Path "$baseDir\components\common\Sidebar.jsx" -Value $sidebar

$topnav = @"
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
        width: `calc(100% - `${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)', // Glassmorphism
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Overview
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={3}>
          <IconButton sx={{ color: 'text.secondary' }}>
            <Search size={20} />
          </IconButton>
          <IconButton sx={{ color: 'text.secondary' }}>
            <Bell size={20} />
          </IconButton>
          
          <Box display="flex" alignItems="center" gap={2} onClick={handleMenuOpen} sx={{ cursor: 'pointer', p: 0.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
            <Box textAlign="right" display={{ xs: 'none', md: 'block' }}>
              <Typography variant="subtitle2" fontWeight="600" lineHeight={1.2}>{user?.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.role.replace('ROLE_', '').replace('_', ' ')}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
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
"@
Set-Content -Path "$baseDir\components\common\TopNav.jsx" -Value $topnav

$mainLayout = @"
import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import TopNav from '../components/common/TopNav';

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4, width: '100%' }}>
        <TopNav />
        <Toolbar /> {/* Spacer for fixed TopNav */}
        <Box sx={{ mt: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
"@
Set-Content -Path "$baseDir\layouts\MainLayout.jsx" -Value $mainLayout

$login = @"
import React, { useState } from 'react';
import { Box, Card, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-form-hook';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#0A192F',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <Box sx={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(10,25,47,0) 70%)' }} />
      <Box sx={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(10,25,47,0) 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card sx={{ 
          p: 5, 
          width: { xs: 320, sm: 400 }, 
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.main', mb: 2, color: 'white' }}>
              <ShieldCheck size={32} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary.main">FinGuard</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>Supply Chain Finance & Fraud Detection</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>
          <Typography variant="body2" align="center" color="text.secondary" mt={2}>
            Demo Accounts: admin, supplier, analyst, bank (pwd: *123)
          </Typography>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Login;
"@
Set-Content -Path "$baseDir\pages\Login.jsx" -Value $login

$dashboard = @"
import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { DollarSign, ShieldAlert, Users, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, color: color, transform: 'scale(3)' }}>
      {icon}
    </Box>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `rgba(0,0,0,0.05)`, color: color, display: 'flex' }}>
          {icon}
        </Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight="600">{title}</Typography>
      </Box>
      <Typography variant="h4" fontWeight="bold" color="text.primary">{value}</Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Box mb={4} component={motion.div} variants={item}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Welcome back, {user?.fullName}
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          Here's what's happening with your supply chain financing today.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3} component={motion.div} variants={item}>
          <StatCard title="Total Financed" value="`$2.4M" icon={<DollarSign size={24} />} color="#2563EB" />
        </Grid>
        <Grid item xs={12} sm={6} md={3} component={motion.div} variants={item}>
          <StatCard title="Active Suppliers" value="142" icon={<Users size={24} />} color="#10B981" />
        </Grid>
        <Grid item xs={12} sm={6} md={3} component={motion.div} variants={item}>
          <StatCard title="Flagged Transactions" value="3" icon={<ShieldAlert size={24} />} color="#EF4444" />
        </Grid>
        <Grid item xs={12} sm={6} md={3} component={motion.div} variants={item}>
          <StatCard title="Growth" value="+12.5%" icon={<TrendingUp size={24} />} color="#8B5CF6" />
        </Grid>
        
        {/* Placeholder for future charts/tables */}
        <Grid item xs={12} md={8} component={motion.div} variants={item}>
          <Card sx={{ borderRadius: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
            <Typography color="text.secondary">Financing Activity Chart (Placeholder)</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4} component={motion.div} variants={item}>
          <Card sx={{ borderRadius: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
            <Typography color="text.secondary">Recent Alerts (Placeholder)</Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
"@
Set-Content -Path "$baseDir\pages\Dashboard.jsx" -Value $dashboard

$unauthorized = @"
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh">
      <Typography variant="h2" color="error.main" fontWeight="bold">403</Typography>
      <Typography variant="h5" mt={2} mb={4}>You don't have permission to access this page.</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Return to Dashboard</Button>
    </Box>
  );
};
export default Unauthorized;
"@
Set-Content -Path "$baseDir\pages\Unauthorized.jsx" -Value $unauthorized

$appRoutes = @"
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more routes here in future phases */}
        </Route>
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
"@
Set-Content -Path "$baseDir\routes\index.jsx" -Value $appRoutes

$appJsx = @"
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import './index.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
"@
Set-Content -Path "$baseDir\App.jsx" -Value $appJsx

$indexCss = @"
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

html, body, #root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  background-color: #F3F4F6;
}

* {
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
"@
Set-Content -Path "$baseDir\index.css" -Value $indexCss

