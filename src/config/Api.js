import axios from 'axios';
import { HTTP_HOST } from './config';

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

        // 1️⃣ Очистка всех cookies на текущем домене
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
        });

        // 2️⃣ Очистка localStorage / sessionStorage (если там хранятся токены)
        //localStorage.clear();
        //sessionStorage.clear();

        // 3️⃣ Редирект на главную
        window.location.href = `${HTTP_HOST}/login`;
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

PROD_AXIOS_INSTANCE.interceptors.request.use((config) => {
    const xsrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    if (xsrfToken) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    return config;
});