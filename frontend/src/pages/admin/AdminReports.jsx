import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, CircularProgress, Alert } from '@mui/material';
import { FileText, Download, Printer } from 'lucide-react';
import { getAdminReports } from '../../services/api';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getAdminReports();
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (reportName, dataset, columns) => {
    setGenerating(true);
    setTimeout(() => {
      const doc = new jsPDF();
      doc.text(`FinGuard ERP - ${reportName}`, 14, 15);
      const tableData = dataset.map(item => columns.map(col => {
        const val = item[col.field];
        if (col.field === 'dateTime' && val) {
          return new Date(val).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
        return val || '';
      }));
      const head = [columns.map(col => col.headerName)];
      
      autoTable(doc, {
        head: head,
        body: tableData,
        startY: 25,
      });
      
      doc.save(`${reportName.replace(' ', '_')}.pdf`);
      setGenerating(false);
    }, 500);
  };

  const generateExcel = (reportName, dataset, columns) => {
    setGenerating(true);
    setTimeout(() => {
      // Map dataset to use header names and format dates
      const formattedData = dataset.map(item => {
        const row = {};
        columns.forEach(col => {
          let val = item[col.field];
          if (col.field === 'dateTime' && val) {
            val = new Date(val).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          }
          row[col.headerName] = val || '';
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      XLSX.writeFile(workbook, `${reportName.replace(' ', '_')}.xlsx`);
      setGenerating(false);
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  const ReportCard = ({ title, description, datasetName, columns }) => {
    const dataset = data ? data[datasetName] : [];
    return (
      <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <Box p={1} bgcolor="rgba(37, 99, 235, 0.1)" color="#2563EB" borderRadius={2}>
              <FileText size={20} />
            </Box>
            <Typography variant="h6" fontWeight="bold">{title}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {description}
          </Typography>
          <Typography variant="subtitle2" color="text.primary" mb={2}>
            Total Records: {dataset ? dataset.length : 0}
          </Typography>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<Download size={16} />}
              onClick={() => generatePDF(title, dataset, columns)}
              disabled={generating || !dataset || dataset.length === 0}
            >
              PDF
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<Download size={16} />} 
              onClick={() => generateExcel(title, dataset, columns)}
              disabled={generating || !dataset || dataset.length === 0}
              color="success"
            >
              Excel
            </Button>
            <Button 
              variant="text" 
              size="small" 
              startIcon={<Printer size={16} />}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" color="text.primary" display="flex" alignItems="center" gap={1.5}>
          <FileText size={28} /> System Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          Generate and export administrative reports
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <ReportCard 
            title="User Activity Report" 
            description="Recent audit logs tracking user actions." 
            datasetName="userActivity"
            columns={[{field: 'username', headerName: 'User'}, {field: 'action', headerName: 'Action'}, {field: 'dateTime', headerName: 'Date'}]}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <ReportCard 
            title="Customer Summary" 
            description="Overview of all registered customers." 
            datasetName="customers"
            columns={[{field: 'customerName', headerName: 'Name'}, {field: 'email', headerName: 'Email'}, {field: 'status', headerName: 'Status'}]}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <ReportCard 
            title="Product Summary" 
            description="Master list of all products." 
            datasetName="products"
            columns={[{field: 'productCode', headerName: 'Code'}, {field: 'productName', headerName: 'Name'}, {field: 'price', headerName: 'Price'}]}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <ReportCard 
            title="Inventory Summary" 
            description="Current stock levels and alerts." 
            datasetName="inventory"
            columns={[{field: 'id', headerName: 'ID'}, {field: 'availableStock', headerName: 'Stock'}, {field: 'lowStockAlertLevel', headerName: 'Alert Level'}]}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <ReportCard 
            title="Sales Orders Report" 
            description="All sales orders placed by customers." 
            datasetName="salesOrders"
            columns={[{field: 'orderNumber', headerName: 'Order #'}, {field: 'totalAmount', headerName: 'Total'}, {field: 'status', headerName: 'Status'}]}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <ReportCard 
            title="Financing & Approvals" 
            description="History of all financing requests." 
            datasetName="financingRequests"
            columns={[{field: 'requestNumber', headerName: 'Req #'}, {field: 'totalAmountRequested', headerName: 'Amount'}, {field: 'status', headerName: 'Status'}]}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminReports;
