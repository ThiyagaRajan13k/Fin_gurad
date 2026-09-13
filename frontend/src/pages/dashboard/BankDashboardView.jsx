import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Button, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { getDashboardBank } from '../../services/api';
import { DollarSign, Activity, Bell, FileText, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
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

const BankDashboardView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardBank();
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
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        label: 'Approval Statistics',
        data: [data.pendingApprovals, data.approvedRequests, data.rejectedRequests],
        backgroundColor: ['rgba(245, 158, 11, 0.6)', 'rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)'],
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
      <Grid item xs={12} sm={6} md={4}>
        <StatCard title="Pending Approvals" value={data.pendingApprovals} icon={<FileText size={24} />} color="#F59E0B" />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard title="Approved Requests" value={data.approvedRequests} icon={<CheckCircle size={24} />} color="#10B981" />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard title="Rejected Requests" value={data.rejectedRequests} icon={<XCircle size={24} />} color="#EF4444" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Total Disbursed" value={`₹${data.totalDisbursedAmount || 0}`} icon={<DollarSign size={24} />} color="#3B82F6" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Average Interest Rate" value={`${data.averageInterestRate || 0}%`} icon={<TrendingUp size={24} />} color="#8B5CF6" />
      </Grid>
      <Grid item xs={12} sm={6} md={3} lg={2.4}>
        <StatCard title="Outstanding Financing" value={`₹${data.outstandingFinancing || 0}`} icon={<DollarSign size={24} />} color="#06B6D4" />
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Card sx={{ borderRadius: 3, height: 350 }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Approval Statistics</Typography>
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
                      secondary={activity.description} 
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
              <Button variant="contained" color="primary" onClick={() => navigate('/bank-approvals')}>Review Pending Approvals</Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BankDashboardView;
