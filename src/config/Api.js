import axios from 'axios';
import { HTTP_ROOT, HTTP_HOST } from './config';

axios.defaults.withCredentials = true;

export const PROD_AXIOS_INSTANCE = axios.create({
    baseURL: HTTP_HOST,
    timeout: 300000,

    // 👇 гарантируем, что 403/419 считаются ошибками
    validateStatus: function (status) {
        return status >= 200 && status < 300;
    }
});

// 👇 универсальный обработчик
const handleAuthError = (status) => {
    if ([401, 403, 419].includes(status)) {
        console.log('Auth/session error:', status);
        window.location.href = HTTP_HOST;
    }
};

PROD_AXIOS_INSTANCE.interceptors.response.use(
    (response) => {
        // 👇 если вдруг 403 прошёл как success
        handleAuthError(response.status);
        return response;
    },
    (error) => {
        if (error.response) {
            handleAuthError(error.response.status);
        } else {
            console.log('Network / CORS error', error);
        }

        return Promise.reject(error);
    }
);