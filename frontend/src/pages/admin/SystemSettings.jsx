import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, CircularProgress, Alert, Divider, Tab, Tabs } from '@mui/material';
import { getSystemSettings, updateSystemSettings } from '../../services/api';
import { Save, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await getSystemSettings();
      if (response.data.success) {
        const settingsObj = {};
        response.data.data.forEach(s => {
          settingsObj[s.settingKey] = s.settingValue;
        });
        setSettings(settingsObj);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await updateSystemSettings(settings);
      if (response.data.success) {
        setSuccess('System settings updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary" display="flex" alignItems="center" gap={1.5}>
            <Settings size={28} /> System Settings
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Manage global application configuration
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
          onClick={handleSave}
          disabled={saving}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ px: 2, pt: 1 }}>
            <Tab label="General" />
            <Tab label="Financial" />
            <Tab label="Preferences" />
          </Tabs>
        </Box>
        <CardContent sx={{ p: 4 }}>
          {tabIndex === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Company Name" value={settings.COMPANY_NAME || ''} onChange={(e) => handleChange('COMPANY_NAME', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Company Email" value={settings.COMPANY_EMAIL || ''} onChange={(e) => handleChange('COMPANY_EMAIL', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Company Phone" value={settings.COMPANY_PHONE || ''} onChange={(e) => handleChange('COMPANY_PHONE', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Company Address" multiline rows={3} value={settings.COMPANY_ADDRESS || ''} onChange={(e) => handleChange('COMPANY_ADDRESS', e.target.value)} />
              </Grid>
            </Grid>
          )}

          {tabIndex === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Default Currency" value={settings.DEFAULT_CURRENCY || ''} onChange={(e) => handleChange('DEFAULT_CURRENCY', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="GST Percentage (%)" value={settings.GST_PERCENTAGE || ''} onChange={(e) => handleChange('GST_PERCENTAGE', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Default Interest Rate (%)" value={settings.DEFAULT_INTEREST_RATE || ''} onChange={(e) => handleChange('DEFAULT_INTEREST_RATE', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Maximum Financing Amount" value={settings.MAX_FINANCING_AMOUNT || ''} onChange={(e) => handleChange('MAX_FINANCING_AMOUNT', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Auto Approval Threshold" value={settings.AUTO_APPROVAL_THRESHOLD || ''} onChange={(e) => handleChange('AUTO_APPROVAL_THRESHOLD', e.target.value)} />
              </Grid>
            </Grid>
          )}

          {tabIndex === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Invoice Prefix" value={settings.INVOICE_PREFIX || ''} onChange={(e) => handleChange('INVOICE_PREFIX', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Sales Order Prefix" value={settings.SALES_ORDER_PREFIX || ''} onChange={(e) => handleChange('SALES_ORDER_PREFIX', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Shipment Prefix" value={settings.SHIPMENT_PREFIX || ''} onChange={(e) => handleChange('SHIPMENT_PREFIX', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Financing Prefix" value={settings.FINANCING_PREFIX || ''} onChange={(e) => handleChange('FINANCING_PREFIX', e.target.value)} />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemSettings;
