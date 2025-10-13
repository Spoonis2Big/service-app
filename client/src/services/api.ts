import axios from 'axios';

// Use the current host's IP/hostname for the API URL
const API_BASE_URL = `http://${window.location.hostname}:3001/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token is invalid or expired, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Service Order Types
export interface ServiceOrder {
  id?: number;
  service_order_number: string;
  date: string;
  customer_name: string;
  phone_number?: string;
  product?: string;
  issues?: string;
  notes?: string;
  pictures?: string[];
  piece_picked_date?: string;
  piece_return_date?: string;
  parts_ordered?: string[];
  part_order_date?: string;
  part_arrival_date?: string;
  serial_number?: string;
  acknowledgment?: string;
  status?: 'open' | 'in_progress' | 'completed' | 'closed';
  created_at?: string;
  updated_at?: string;
}

export interface DashboardAnalytics {
  openServiceOrders: number;
  averageAge: number;
  partsOnOrder: number;
  piecesPickedUp: number;
}

// Service Order API
export const serviceOrderAPI = {
  // Get all service orders
  getAll: async (): Promise<ServiceOrder[]> => {
    const response = await api.get('/service-orders');
    return response.data;
  },

  // Get service order by ID
  getById: async (id: number): Promise<ServiceOrder> => {
    const response = await api.get(`/service-orders/${id}`);
    return response.data;
  },

  // Get service order by service order number
  getByNumber: async (orderNumber: string): Promise<ServiceOrder> => {
    const response = await api.get(`/service-orders/number/${orderNumber}`);
    return response.data;
  },

  // Create new service order
  create: async (orderData: Omit<ServiceOrder, 'id'>): Promise<{ id: number; service_order_number: string; message: string }> => {
    const response = await api.post('/service-orders', orderData);
    return response.data;
  },

  // Update service order
  update: async (id: number, orderData: ServiceOrder): Promise<{ message: string }> => {
    const response = await api.put(`/service-orders/${id}`, orderData);
    return response.data;
  },

  // Delete service order
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/service-orders/${id}`);
    return response.data;
  },

  // Upload pictures
  uploadPictures: async (id: number, files: FileList): Promise<{ message: string; pictures: string[] }> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('pictures', file);
    });

    const response = await api.post(`/service-orders/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard analytics
  getAnalytics: async (): Promise<DashboardAnalytics> => {
    const response = await api.get('/dashboard/analytics');
    return response.data;
  },

  // Get detailed analytics
  getDetailedAnalytics: async (): Promise<{
    statusBreakdown: Array<{ status: string; count: number }>;
    monthlyTrend: Array<{ month: string; count: number }>;
  }> => {
    const response = await api.get('/dashboard/analytics/detailed');
    return response.data;
  },
};

export default api;