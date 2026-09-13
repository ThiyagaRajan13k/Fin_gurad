import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { ShieldCheck, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const modules = [
  'Dashboard', 'User Management', 'Role Management', 'System Settings', 'Audit Logs', 'Reports',
  'Customer Master', 'Product Master', 'Inventory', 'Sales Orders', 'Shipments', 'Invoices',
  'Financing Requests', 'Bank Approvals', 'Fraud Detection', 'Fraud Reports'
];

const rolePermissions = {
  ROLE_ADMIN: ['Dashboard', 'User Management', 'Role Management', 'System Settings', 'Audit Logs', 'Reports'],
  ROLE_SUPPLIER: ['Dashboard', 'Customer Master', 'Product Master', 'Inventory', 'Sales Orders', 'Shipments', 'Invoices', 'Financing Requests'],
  ROLE_RISK_ANALYST: ['Dashboard', 'Fraud Detection', 'Fraud Reports'],
  ROLE_BANK_OFFICER: ['Dashboard', 'Financing Requests', 'Bank Approvals', 'Reports']
};

const RoleManagement = () => {
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" color="text.primary" display="flex" alignItems="center" gap={1.5}>
          <ShieldCheck size={28} /> Role Management
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          System Permission Matrix (Read-Only)
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>System Module</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#2563EB' }}>Admin</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#10B981' }}>Supplier</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#EF4444' }}>Risk Analyst</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>Bank Officer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modules.map((module) => (
                  <TableRow key={module} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{module}</TableCell>
                    <TableCell align="center">
                      {rolePermissions.ROLE_ADMIN.includes(module) ? <Check size={20} color="#10B981" /> : <X size={20} color="#E5E7EB" />}
                    </TableCell>
                    <TableCell align="center">
                      {rolePermissions.ROLE_SUPPLIER.includes(module) ? <Check size={20} color="#10B981" /> : <X size={20} color="#E5E7EB" />}
                    </TableCell>
                    <TableCell align="center">
                      {rolePermissions.ROLE_RISK_ANALYST.includes(module) ? <Check size={20} color="#10B981" /> : <X size={20} color="#E5E7EB" />}
                    </TableCell>
                    <TableCell align="center">
                      {rolePermissions.ROLE_BANK_OFFICER.includes(module) ? <Check size={20} color="#10B981" /> : <X size={20} color="#E5E7EB" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RoleManagement;
