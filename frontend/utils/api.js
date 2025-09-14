import axios from 'axios';
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000' });
api.interceptors.request.use(cfg=>{ const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null; if(t) cfg.headers.Authorization = 'Bearer ' + t; return cfg; });
export default api;
