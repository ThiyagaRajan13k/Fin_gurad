import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

import AdminDashboardView from './dashboard/AdminDashboardView';
import SupplierDashboardView from './dashboard/SupplierDashboardView';
import FraudAnalystDashboardView from './dashboard/FraudAnalystDashboardView';
import BankDashboardView from './dashboard/BankDashboardView';

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

  const renderRoleBasedDashboard = () => {
    switch(user?.role) {
      case 'ROLE_ADMIN':
        return <AdminDashboardView />;
      case 'ROLE_SUPPLIER':
        return <SupplierDashboardView />;
      case 'ROLE_FRAUD_ANALYST':
        return <FraudAnalystDashboardView />;
      case 'ROLE_BANK_OFFICER':
        return <BankDashboardView />;
      case 'ROLE_RISK_ANALYST':
        return <FraudAnalystDashboardView />;
      default:
        return (
          <Box p={4} textAlign="center">
            <Typography variant="h6" color="text.secondary">
              Welcome to FinGuard. Use the sidebar to navigate to your permitted modules.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Box mb={4} component={motion.div} variants={item}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Welcome back, {user?.fullName}
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          {user?.role === 'ROLE_ADMIN' ? "Here is an overview of the FinGuard ERP system." : "Here's what's happening with your account today."}
        </Typography>
      </Box>

      <Box component={motion.div} variants={item}>
        {renderRoleBasedDashboard()}
      </Box>
    </Box>
  );
};

export default Dashboard;
