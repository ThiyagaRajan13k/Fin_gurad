import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Button, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { getDashboardAdmin } from '../../services/api';
import { motion } from 'framer-motion';
import { Users, DollarSign, ShieldAlert, TrendingUp, ShoppingCart, Package, CheckCircle, Activity, Bell, FileText } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
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

const AdminDashboardView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardAdmin();
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
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Platform Growth (Users)',
        data: [10, 15, 20, Math.max(20, data.totalUsers - 5), data.totalUsers],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        tension: 0.4
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
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Total Users" value={data.totalUsers} icon={<Users size={24} />} color="#2563EB" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Active Users" value={data.activeUsers} icon={<Users size={24} />} color="#10B981" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="System Health" value={data.systemHealth} icon={<Activity size={24} />} color="#10B981" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Total Customers" value={data.totalCustomers} icon={<Users size={24} />} color="#F59E0B" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Total Products" value={data.totalProducts} icon={<Package size={24} />} color="#8B5CF6" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Total Sales Orders" value={data.totalSalesOrders} icon={<ShoppingCart size={24} />} color="#06B6D4" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Total Invoices" value={data.totalInvoices} icon={<FileText size={24} />} color="#3B82F6" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Financing Reqs" value={data.totalFinancingRequests} icon={<DollarSign size={24} />} color="#8B5CF6" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Total Fraud Cases" value={data.totalFraudCases} icon={<ShieldAlert size={24} />} color="#EF4444" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Approved Financing" value={`₹${data.totalApprovedFinancing || 0}`} icon={<CheckCircle size={24} />} color="#10B981" />
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Card sx={{ borderRadius: 3, height: 350 }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>System Growth</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <Line options={chartOptions} data={chartData} />
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
              <Button variant="contained" onClick={() => navigate('/users')}>Manage Users</Button>
              <Button variant="outlined" onClick={() => navigate('/fraud')}>View Fraud Reports</Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminDashboardView;
