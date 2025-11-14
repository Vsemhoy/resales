export const PRODMODE = !(
	window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
);
// Тянем токен со страницы
export const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]')
	? document.querySelector('meta[name="csrf-token"]').content
	: 'http://localhost/';
export const HTTP_HOST = document.querySelector('meta[name="host"]')
	? document.querySelector('meta[name="host"]').content
	: null;
export const HTTP_ROOT = HTTP_HOST ? HTTP_HOST.replace('resales', '') : '';
export const HOST_COMPONENT_ROOT = !PRODMODE ? '' : '/com/resales';

export const BASE_NAME = PRODMODE ? '/resales' : '/';
export const BASE_ROUTE = PRODMODE ? '/resales' : '';

// Websocket backend-for-frontend PORT
export const BFF_PORT = 5003;
