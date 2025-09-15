import { useEffect, useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../config/Api.js';

export const useSms = ({ url, mock, axiosOptions = {} }) => {
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
					const response = await PROD_AXIOS_INSTANCE.get(url, {
						headers: {
							'X-CSRF-TOKEN': CSRF_TOKEN,
							...axiosOptions.headers,
						},
						...axiosOptions,
					});
					console.log('API response:', response.data);

					// Безопасно получаем sms из API, если структура совпадает
					responseData = response?.data?.[0]?.content?.sms || [];
				} else {
					// Если mock - функция, вызываем, иначе берем как есть
					const mockData = typeof mock === 'function' ? mock() : mock;
					responseData = mockData?.[0]?.content?.sms || [];
				}

				setData(responseData);
			} catch (err) {
				setError(err.message || 'Unknown error');
				setData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [url]);

	return { data, loading, error };
};
