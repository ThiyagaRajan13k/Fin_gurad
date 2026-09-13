import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import SystemSettings from '../pages/admin/SystemSettings';
import AuditLogs from '../pages/admin/AuditLogs';
import RoleManagement from '../pages/admin/RoleManagement';
import AdminReports from '../pages/admin/AdminReports';

import { useAuth } from '../context/AuthContext';
import Users from '../pages/admin/Users';
import Customers from '../pages/master/Customers';
import Categories from '../pages/master/Categories';
import Products from '../pages/master/Products';
import Inventory from '../pages/master/Inventory';

import SalesOrders from '../pages/sd/SalesOrders';
import Shipments from '../pages/sd/Shipments';
import Invoices from '../pages/sd/Invoices';
import Financing from '../pages/sd/Financing';
import FraudDetection from '../pages/FraudDetection';
import BankApprovals from '../pages/BankApprovals';

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
          <Route path="/users" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><Users /></ProtectedRoute>} />
          <Route path="/roles" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><RoleManagement /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><SystemSettings /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><AuditLogs /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_BANK_OFFICER']}><AdminReports /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute allowedRoles={['ROLE_BANK_OFFICER', 'ROLE_SUPPLIER']}><Customers /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute allowedRoles={['ROLE_SUPPLIER']}><Categories /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute allowedRoles={['ROLE_SUPPLIER']}><Products /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute allowedRoles={['ROLE_SUPPLIER']}><Inventory /></ProtectedRoute>} />
          <Route path="/sales-orders" element={<ProtectedRoute allowedRoles={['ROLE_SUPPLIER']}><SalesOrders /></ProtectedRoute>} />
          <Route path="/shipments" element={<ProtectedRoute allowedRoles={['ROLE_SUPPLIER']}><Shipments /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute allowedRoles={['ROLE_SUPPLIER', 'ROLE_BANK_OFFICER']}><Invoices /></ProtectedRoute>} />
          <Route path="/financing" element={<ProtectedRoute allowedRoles={['ROLE_SUPPLIER', 'ROLE_BANK_OFFICER', 'ROLE_RISK_ANALYST']}><Financing /></ProtectedRoute>} />
          <Route path="/fraud" element={<ProtectedRoute allowedRoles={['ROLE_FRAUD_ANALYST', 'ROLE_RISK_ANALYST']}><FraudDetection /></ProtectedRoute>} />
          <Route path="/bank-approvals" element={<ProtectedRoute allowedRoles={['ROLE_BANK_OFFICER']}><BankApprovals /></ProtectedRoute>} />
          {/* Add more routes here in future phases */}
        </Route>
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
