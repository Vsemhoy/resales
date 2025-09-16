import { useEffect, useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../config/Api.js';

export const useSms = ({ url, mock = {} }) => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				let responseData = [];

				if (PRODMODE) {
					try {
						const response = await PROD_AXIOS_INSTANCE.post('/api/sms', {
							data: {},
							_token: CSRF_TOKEN,
						});

						console.log('[useSms] Ответ от сервера:', response.data);

						const sms = response?.data?.content?.sms;

						if (Array.isArray(sms)) {
							responseData = sms;
						} else {
							console.warn('[useSms] СМС в ответе сервера не является массивом');
						}
					} catch (err) {
						console.error('[useSms] Ошибка при запросе /api/sms:', err);
						throw new Error('Не удалось загрузить SMS с сервера');
					}
				} else {
					console.log('[useSms] Используются MOCK-данные (dev mode)');
					const mockData = typeof mock === 'function' ? mock() : mock;

					console.log('[useSms] MOCK-данные:', mockData);

					const sms = mockData?.content?.sms;

					if (Array.isArray(sms)) {
						responseData = sms;
					} else {
						console.warn('[useSms] MOCK-данные не содержат массив sms');
					}
				}

				setData(responseData);
			} catch (err) {
				console.error('[useSms] Ошибка при загрузке данных:', err);
				setError(err.message || 'Неизвестная ошибка');
				setData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [url, mock]);

	return { data, loading, error };
};
