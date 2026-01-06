import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
};

// Products API
export const products = {
  getAll: () => api.get('/products'),
  getOne: (id: string) => api.get(`/products/${id}`),
};

// Orders API
export const orders = {
  checkout: (items: { productId: string; quantity: number }[]) =>
    api.post('/orders/checkout', { items }),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOne: (id: string) => api.get(`/orders/${id}`),
  getAll: () => api.get('/orders'),
  // Demo endpoints for simulating payment flow
  simulatePayment: (id: string) => api.post(`/orders/${id}/simulate-payment`),
  fulfillOrder: (id: string) => api.post(`/orders/${id}/fulfill`),
};

// Inventory API (Admin)
export const inventory = {
  getAll: () => api.get('/inventory'),
  getOne: (productId: string) => api.get(`/inventory/${productId}`),
  update: (productId: string, data: { availableQuantity?: number; adjustQuantity?: number }) =>
    api.patch(`/inventory/${productId}`, data),
};

// Audit API (Admin)
export const audit = {
  getRecent: (limit?: number) => api.get(`/audit${limit ? `?limit=${limit}` : ''}`),
  getByEntity: (type: string, id: string) => api.get(`/audit/entity/${type}/${id}`),
  getByActor: (actorId: string) => api.get(`/audit/actor/${actorId}`),
};
