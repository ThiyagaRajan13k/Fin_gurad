import api from './api';

export const getAllInventory = async () => {
  const response = await api.get('/inventory');
  return response.data;
};

export const getInventoryByProductId = async (productId) => {
  const response = await api.get(`/inventory/product/${productId}`);
  return response.data;
};

export const createOrUpdateInventory = async (data) => {
  const response = await api.post('/inventory', data);
  return response.data;
};

export const adjustStock = async (productId, amount) => {
  const response = await api.post('/inventory/adjust', { productId, amount });
  return response.data;
};

export const syncInventory = async () => {
  const response = await api.post('/inventory/sync');
  return response.data;
};
