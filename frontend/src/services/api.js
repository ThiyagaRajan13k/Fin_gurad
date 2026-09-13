import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getCategories = () => api.get('/categories');
export const getProducts = () => api.get('/products');
export const createProduct = (product) => api.post('/products', product);
export const getInventory = () => api.get('/inventory');
export const getCustomers = () => api.get('/customers');
export const createCustomer = (customer) => api.post('/customers', customer);

// Sales Orders (SD Module)
export const getSalesOrders = () => api.get('/sales-orders');
export const createSalesOrder = (order) => api.post('/sales-orders', order);
export const updateSalesOrderStatus = (id, status) => api.put(`/sales-orders/${id}/status?status=${status}`);

// Shipments
export const getShipments = () => api.get('/shipments');
export const createShipment = (shipment) => api.post('/shipments', shipment);
export const updateShipmentStatus = (id, status) => api.put(`/shipments/${id}/status?status=${status}`);

// Invoices
export const getInvoices = () => api.get('/invoices');
export const createInvoiceFromOrder = (orderId) => api.post(`/invoices/from-order/${orderId}`);
export const updateInvoiceStatus = (id, status) => api.put(`/invoices/${id}/status?status=${status}`);
export const getInvoice = (id) => api.get(`/invoices/${id}`);

// Financing
export const getFinancingRequests = () => api.get('/financing');
export const getFinancingRequest = (id) => api.get(`/financing/${id}`);
export const createFinancingRequest = (request) => api.post('/financing', request);
export const updateFinancingStatus = (id, status) => api.put(`/financing/${id}/status?status=${status}`);

// Dashboards
export const getDashboardAdmin = () => api.get('/dashboard/admin');
export const getDashboardSupplier = () => api.get('/dashboard/supplier');
export const getDashboardFraudAnalyst = () => api.get('/dashboard/fraud-analyst');
export const getDashboardBank = () => api.get('/dashboard/bank');

// System Settings
export const getSystemSettings = () => api.get('/settings');
export const updateSystemSettings = (settings) => api.put('/settings', settings);

// Audit Logs
export const getAuditLogs = () => api.get('/audit');

// Reports
export const getAdminReports = () => api.get('/reports/admin');

// Fraud Detection
export const getFraudReports = () => api.get('/fraud');
export const getFraudReport = (id) => api.get(`/fraud/${id}`);
export const updateFraudDecision = (id, decision, remarks) => api.put(`/fraud/${id}/decision`, null, { params: { decision, remarks } });

// Bank Approvals
export const getBankApprovals = () => api.get('/bank-approvals');
export const getBankApproval = (id) => api.get(`/bank-approvals/${id}`);
export const processBankApproval = (data) => api.post('/bank-approvals/process', null, { params: data });

export default api;
