export const PRODMODE = (!(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));
// Тянем токен со страницы
export const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]') ? document.querySelector('meta[name="csrf-token"]').content : null;
export const HTTP_HOST  = document.querySelector('meta[name="host"]') ? document.querySelector('meta[name="host"]').content : null;
export const HTTP_ROOT = HTTP_HOST ? HTTP_HOST.replace('time', '') : '';
export const HOST_COMPONENT_ROOT = !PRODMODE ? '' : '/com/timeskud';

export const BASE_NAME = PRODMODE ? '/skud' : '/';
export const BASE_ROUTE = PRODMODE ? '/skud' : '';