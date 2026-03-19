import axios from 'axios';
import {HTTP_ROOT, HTTP_HOST} from './config';
// const PROD_API_URL = 'http://89.104.68.50'
// export const PROD_API_URL = 'https://pulse-retail.ru'
axios.defaults.withCredentials = true;
export const PROD_AXIOS_INSTANCE = axios.create({
    baseURL: HTTP_HOST,
    timeout: 300000,
});
PROD_AXIOS_INSTANCE.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 419) {
            console.log('Session expired / CSRF token invalid');
            window.location.href = HTTP_HOST;
        }

        return Promise.reject(error);
    }
);