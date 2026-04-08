import axios from 'axios';
import type { Restaurant, Order } from '../types';
import { OrderStatus } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const restaurantService = {
  getRestaurants: async (search?: string) => {
    const response = await api.get<Restaurant[]>('/restaurants', {
      params: { search }
    });
    return response.data;
  },
  getRestaurantById: async (id: string) => {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  },
};

export const orderService = {
  createOrder: async (customerId: string, restaurantId: string) => {
    const response = await api.post<Order>('/orders', { customerId, restaurantId });
    return response.data;
  },
  getOrder: async (id: string) => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },
  updateStatus: async (orderId: string, newStatus: OrderStatus) => {
    const response = await api.patch<Order>('/orders/status', { orderId, newStatus });
    return response.data;
  },
};

export const paymentService = {
  processPayment: async (orderId: string, amount: number, method: 'CARD' | 'UPI' | 'COD') => {
    const response = await api.post('/payments/process', { orderId, amount, method });
    return response.data;
  },
};

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/users/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
