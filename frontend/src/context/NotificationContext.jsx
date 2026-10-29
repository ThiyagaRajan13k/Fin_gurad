import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllInventory } from '../services/inventoryService';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toastAlert, setToastAlert] = useState(null);
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = sessionStorage.getItem('finguard_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const refreshAlerts = useCallback(async () => {
    try {
      const inventoryList = await getAllInventory();
      if (!Array.isArray(inventoryList)) return;

      const newAlerts = [];
      const outOfStockItems = [];

      inventoryList.forEach(item => {
        if (item.availableStock <= 0) {
          outOfStockItems.push(item);
          newAlerts.push({
            id: `oos-${item.productId || item.id}`,
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            availableStock: 0,
            severity: 'error',
            type: 'OUT_OF_STOCK',
            title: 'Out of Stock Alert',
            message: `Product '${item.productName}' (${item.productCode}) is OUT OF STOCK (0 units available)! Suppliers cannot add this product to orders.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        } else if (item.availableStock <= (item.lowStockAlertLevel || 10)) {
          newAlerts.push({
            id: `low-${item.productId || item.id}`,
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            availableStock: item.availableStock,
            severity: 'warning',
            type: 'LOW_STOCK',
            title: 'Low Stock Alert',
            message: `Product '${item.productName}' has only ${item.availableStock} units remaining (Alert level: ${item.lowStockAlertLevel}).`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      });

      // Show toast if there's any out of stock item that hasn't been toasted yet in this session
      if (outOfStockItems.length > 0) {
        const lastToastedKey = 'finguard_last_oos_toast';
        const alreadyToasted = sessionStorage.getItem(lastToastedKey);
        const currentOosCodes = outOfStockItems.map(i => i.productCode).sort().join(',');

        if (alreadyToasted !== currentOosCodes) {
          sessionStorage.setItem(lastToastedKey, currentOosCodes);
          const itemNames = outOfStockItems.map(i => i.productName).join(', ');
          setToastAlert({
            title: 'Inventory Alert: Product Out of Stock!',
            message: `${itemNames} reached OUT OF STOCK (0 units remaining). Please replenish inventory.`
          });
        }
      }

      setNotifications(newAlerts);
    } catch (err) {
      console.error('Failed to load inventory notifications', err);
    }
  }, []);

  useEffect(() => {
    refreshAlerts();
    // Poll every 30 seconds for live stock changes
    const timer = setInterval(refreshAlerts, 30000);
    return () => clearInterval(timer);
  }, [refreshAlerts]);

  const markAsRead = (id) => {
    const updated = [...readIds, id];
    setReadIds(updated);
    sessionStorage.setItem('finguard_read_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    sessionStorage.setItem('finguard_read_notifications', JSON.stringify(allIds));
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;
  const outOfStockCount = notifications.filter(n => n.type === 'OUT_OF_STOCK').length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        outOfStockCount,
        readIds,
        markAsRead,
        markAllAsRead,
        refreshAlerts,
        setToastAlert
      }}
    >
      {children}
      <Snackbar
        open={Boolean(toastAlert)}
        autoHideDuration={6000}
        onClose={() => setToastAlert(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 10 }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setToastAlert(null)}
          sx={{ width: '100%', boxShadow: '0 8px 24px rgba(211, 47, 47, 0.4)', borderRadius: 2 }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>{toastAlert?.title}</AlertTitle>
          {toastAlert?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
