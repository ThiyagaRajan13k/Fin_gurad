import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CircularProgress, Alert } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { getAuditLogs } from '../../services/api';
import { Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await getAuditLogs();
      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      field: 'dateTime', 
      headerName: 'Date & Time', 
      width: 220,
      renderCell: (params) => {
        const date = params.value ? new Date(params.value) : null;
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Clock size={16} color="#6B7280" />
            <Typography variant="body2">
              {date ? date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
            </Typography>
          </Box>
        );
      }
    },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'module', headerName: 'Module', width: 130 },
    { field: 'action', headerName: 'Action', width: 200 },
    { field: 'entityName', headerName: 'Entity', width: 130 },
    { field: 'entityId', headerName: 'Entity ID', width: 130 },
    { field: 'ipAddress', headerName: 'IP Address', width: 150 },
  ];

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" color="text.primary" display="flex" alignItems="center" gap={1.5}>
          <Shield size={28} /> Audit Logs
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          Track critical user activities and system events
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, height: 600 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={logs}
            columns={columns}
            getRowId={(row) => row.id}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              sorting: { sortModel: [{ field: 'dateTime', sort: 'desc' }] },
            }}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell:focus': { outline: 'none' },
              '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(0,0,0,0.02)' }
            }}
          />
        )}
      </Card>
    </Box>
  );
};

export default AuditLogs;
