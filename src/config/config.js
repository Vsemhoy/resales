export const PRODMODE = true;
// Websocket backend-for-frontend PORT
export const BFF_PORT = 5003;


// Новое
export const HTTP_ROOT = window.location.hostname; // только IP или домен, без порта
export const HTTP_HOST = `http://${window.location.hostname}`;
export const FRONT_PORT = window.location.port;
export const HTTP_HOST_FRONT = `http://${window.location.hostname}:${FRONT_PORT}`;
export const BASE_NAME = PRODMODE ? '/' : '/';
export const BASE_ROUTE = PRODMODE ? '' : '';
export const CSRF_TOKEN = decodeURIComponent(
    document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1] || ''
);
export const ROUTE_PREFIX = '/api';

console.log('HTTP_ROOT', HTTP_ROOT);
console.log('HTTP_HOST', HTTP_HOST);
console.log('CSRF_TOKEN', CSRF_TOKEN);
console.log('ROUTE_PREFIX', ROUTE_PREFIX);
