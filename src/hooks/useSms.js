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
					let response;

					try {
						response = await PROD_AXIOS_INSTANCE.post('/api/sms', {
							data: {},
							_token: CSRF_TOKEN,
						});
					} catch (err) {
						console.error('[useSms] Ошибка при запросе /api/sms:', err);
						throw new Error('Не удалось загрузить SMS с сервера');
					}

					console.log('[useSms] Ответ от сервера:', response.data);

					if (
						Array.isArray(response?.data) &&
						response.data[0]?.content?.sms &&
						Array.isArray(response.data[0].content.sms)
					) {
						responseData = response.data[0].content.sms;
					} else {
						console.warn('[useSms] Ответ от сервера не содержит ожидаемые данные');
						responseData = [];
					}
				} else {
					console.log('[useSms] Используется MOCK-данные (dev mode)');
					const mockData = typeof mock === 'function' ? mock() : mock;

					console.log('[useSms] MOCK-данные:', mockData);

					if (
						Array.isArray(mockData) &&
						mockData[0]?.content?.sms &&
						Array.isArray(mockData[0].content.sms)
					) {
						responseData = mockData[0].content.sms;
					} else {
						console.warn('[useSms] MOCK-данные не содержат ожидаемую структуру');
						responseData = [];
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
