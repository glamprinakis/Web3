// react/src/api.js
import axios from 'axios';
import API_BASE from './config';

// A single axios client you can import everywhere
export const api = axios.create({ baseURL: API_BASE });

// (Optional) attach JWT automatically if you store it in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // change if you store it elsewhere
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Common calls
export const getProducts = () => api.get('/products').then(r => r.data);
export const getProductsByCategory = (category) => api.get(`/products/${category}`).then(r => r.data);
export const getProductById = (id) => api.get(`/products/id/${id}`).then(r => r.data);
export const addToCart = (data) => api.post('/carts', data).then(r => r.data);
export const loginUser = async (data) => {
  const response = await api.post('/user/login', data);
  const { token, uid, username } = response.data;
  localStorage.setItem('token', token);
  localStorage.setItem('uid', uid);
  localStorage.setItem('username', username);
  return response.data;
};
export const registerUser = (data) => api.post('/user/signup', data);
export const getUserOrders = (uid) => api.get(`/users/${uid}/orders`).then(r => r.data);
export const getOrderProducts = (orderId) => api.get(`/orders/${orderId}/products`).then(r => r.data);
export const getUser = (uid) => api.get(`/users/${uid}`).then(r => r.data);
export const updateUser = (uid, data) => api.post(`/users/${uid}/update`, data).then(r => r.data);
export const submitContact = (data) => api.post('/contact', data).then(r => r.data);