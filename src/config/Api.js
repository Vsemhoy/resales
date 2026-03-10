import axios from 'axios';
import { HTTP_HOST } from './config';
// const PROD_API_URL = 'http://89.104.68.50'
// export const PROD_API_URL = 'https://pulse-retail.ru'
axios.defaults.withCredentials = true;
export const PROD_API_URL = HTTP_HOST;
const token = document.querySelector('meta[name="jwt"]')?.getAttribute('content');
export const PROD_AXIOS_INSTANCE = axios.create({
    baseURL: PROD_API_URL,
    timeout: 300000,
});
PROD_AXIOS_INSTANCE.interceptors.request.use((config) => {
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});
