import axios from 'axios';
import { HTTP_HOST } from './config';

// const PROD_API_URL = 'http://89.104.68.50'
// export const PROD_API_URL = 'https://pulse-retail.ru'
export const PROD_API_URL = HTTP_HOST;
export const PROD_AXIOS_INSTANCE = axios.create({
	baseURL: PROD_API_URL,
	timeout: 10000,
});
