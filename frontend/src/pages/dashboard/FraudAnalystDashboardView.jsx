import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Button, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { getDashboardFraudAnalyst } from '../../services/api';
import { ShieldAlert, Activity, Bell, FileText, CheckCircle, AlertTriangle, Flag } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

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

const FraudAnalystDashboardView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardFraudAnalyst();
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
    labels: ['High Risk', 'Medium Risk', 'Safe'],
    datasets: [
      {
        data: [data.highRiskRequests, data.mediumRiskRequests, data.safeRequests],
        backgroundColor: ['rgba(239, 68, 68, 0.6)', 'rgba(245, 158, 11, 0.6)', 'rgba(16, 185, 129, 0.6)'],
        borderColor: ['#EF4444', '#F59E0B', '#10B981'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard title="Pending Fraud Reviews" value={data.pendingFraudReviews} icon={<FileText size={24} />} color="#F59E0B" />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard title="Average Fraud Score" value={`${data.averageFraudScore} / 100`} icon={<Activity size={24} />} color="#8B5CF6" />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard title="High Risk Requests" value={data.highRiskRequests} icon={<AlertTriangle size={24} />} color="#EF4444" />
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Card sx={{ borderRadius: 3, height: 350 }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Fraud Distribution</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', justifyContent: 'center' }}>
              <Doughnut options={chartOptions} data={chartData} />
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
              <Button variant="contained" color="primary" onClick={() => navigate('/fraud')}>Review Pending Cases</Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default FraudAnalystDashboardView;
