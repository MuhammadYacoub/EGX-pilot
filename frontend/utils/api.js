import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check if we're on the client side before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const marketAPI = {
  getOverview: () => api.get('/stocks/market/overview'),
  getLiveData: async () => {
    try {
      const response = await api.get('/stocks/market/overview');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch live market data, using fallback');
      return {
        success: true,
        data: {
          egx30: { value: 25670.5, change: 2.3, volume: 1.2 },
          egx70: { value: 4120.8, change: -0.8, volume: 0.9 },
          totalVolume: 2.1,
          marketCap: 45.2,
          status: 'fallback'
        }
      };
    }
  }
};

export const stocksAPI = {
  getAll: (params = {}) => api.get('/stocks', { params }),
  getBySymbol: (symbol) => api.get(`/stocks/${symbol}`),
  getLivePrice: (symbol) => api.get(`/stocks/${symbol}/live`),
  getTopStocks: (params = {}) => api.get('/stocks/top', { params }),
  search: (query, limit = 10) => api.get(`/stocks/search/${query}`, { params: { limit } }),
  getSectors: () => api.get('/stocks/meta/sectors'),
};

export const opportunitiesAPI = {
  getCurrent: () => api.get('/opportunities/current'),
  scan: () => api.get('/opportunities/scan'),
  getHistory: () => api.get('/opportunities/history'),
};

export const portfolioAPI = {
  getAll: () => api.get('/portfolios'),
  getById: (id) => api.get(`/portfolios/${id}`),
  create: (data) => api.post('/portfolios', data),
  buy: (id, data) => api.post(`/portfolios/${id}/buy`, data),
  sell: (id, data) => api.post(`/portfolios/${id}/sell`, data),
  getPerformance: (id) => api.get(`/portfolios/${id}/performance`),
};

export const analysisAPI = {
  getAnalysis: (symbol) => api.get(`/analysis/${symbol}`),
  getIndicators: (symbol) => api.get(`/analysis/${symbol}/indicators`),
  getSignals: (symbol) => api.get(`/analysis/${symbol}/signals`),
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

export default api;
