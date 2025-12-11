// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Contracts API
export const contractsAPI = {
    getAll: () => api.get('/contracts'),
    getById: (id: string) => api.get(`/contracts/${id}`),
    create: (data: any) => api.post('/contracts', data),
    update: (id: string, data: any) => api.put(`/contracts/${id}`, data),
    delete: (id: string) => api.delete(`/contracts/${id}`),
    updateStatus: (id: string, status: string) => api.put(`/contracts/${id}/status`, { statut: status }),
};

// Clients API
export const clientsAPI = {
    getAll: () => api.get('/clients'),
    getById: (id: string) => api.get(`/clients/${id}`),
    create: (data: any) => api.post('/clients', data),
    update: (id: string, data: any) => api.put(`/clients/${id}`, data),
    delete: (id: string) => api.delete(`/clients/${id}`),
};

// Vehicles API
export const vehiclesAPI = {
    getAll: () => api.get('/vehicules'),
    getById: (id: string) => api.get(`/vehicules/${id}`),
    create: (data: any) => api.post('/vehicules', data),
    update: (id: string, data: any) => api.put(`/vehicules/${id}`, data),
    delete: (id: string) => api.delete(`/vehicules/${id}`),
};

// Invoices API
export const invoicesAPI = {
    getAll: () => api.get('/invoices'),
    getById: (id: string) => api.get(`/invoices/${id}`),
    create: (data: any) => api.post('/invoices', data),
    update: (id: string, data: any) => api.put(`/invoices/${id}`, data),
    delete: (id: string) => api.delete(`/invoices/${id}`),
};

export default api;
