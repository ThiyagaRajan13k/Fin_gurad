import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Button, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { getDashboardSupplier } from '../../services/api';
import { Users, ShoppingCart, Truck, Package, Activity, Bell, ShieldAlert, FileText, DollarSign } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, color: color, transform: 'scale(3)' }}>
      {icon}
    </Box>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.05)', color: color, display: 'flex' }}>
          {icon}
        </Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight="600">{title}</Typography>
      </Box>
      <Typography variant="h4" fontWeight="bold" color="text.primary">{value}</Typography>
    </CardContent>
  </Card>
);

const SupplierDashboardView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardSupplier();
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  const chartData = {
    labels: ['Available Stock', 'Low Stock', 'Total Products'],
    datasets: [
      {
        label: 'Inventory Status',
        data: [data.availableInventory, data.lowStockProducts, data.totalProducts],
        backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)', 'rgba(59, 130, 246, 0.6)'],
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Total Customers" value={data.totalCustomers} icon={<Users size={24} />} color="#2563EB" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Total Products" value={data.totalProducts} icon={<Package size={24} />} color="#8B5CF6" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Available Inventory" value={data.availableInventory} icon={<Package size={24} />} color="#10B981" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Low Stock Products" value={data.lowStockProducts} icon={<ShieldAlert size={24} />} color="#EF4444" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Pending Sales Orders" value={data.pendingSalesOrders} icon={<ShoppingCart size={24} />} color="#F59E0B" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Active Shipments" value={data.activeShipments} icon={<Truck size={24} />} color="#06B6D4" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Generated Invoices" value={data.generatedInvoices} icon={<FileText size={24} />} color="#6366F1" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Pending Financing Reqs" value={data.pendingFinancingRequests} icon={<DollarSign size={24} />} color="#F43F5E" />
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Card sx={{ borderRadius: 3, height: 350 }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Inventory Status</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <Bar options={chartOptions} data={chartData} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center" gap={1}>
              <Activity size={20} /> Recent Activities
            </Typography>
            <List>
              {data.recentActivities?.map((activity, idx) => (
                <React.Fragment key={idx}>
                  <ListItem px={0}>
                    <ListItemIcon sx={{ minWidth: 40 }}><Bell size={18} color="#6B7280" /></ListItemIcon>
                    <ListItemText 
                      primary={activity.action} 
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {activity.description}
                          </Typography>
                          <Typography component="span" variant="caption" display="block" color="text.secondary">
                            {activity.timestamp ? new Date(activity.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </Typography>
                        </React.Fragment>
                      } 
                      primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 'bold' }}
                    />
                  </ListItem>
                  {idx < data.recentActivities.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>Quick Actions</Typography>
            <Box display="flex" gap={2}>
              <Button variant="contained" onClick={() => navigate('/sales-orders')}>Manage Orders</Button>
              <Button variant="outlined" onClick={() => navigate('/financing')}>Request Financing</Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SupplierDashboardView;
