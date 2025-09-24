import { useEffect, useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';

export const useSms = ({ chatId = null, mock = {} }) => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);

			console.log('[useSms] START fetch, chatId =', chatId, 'PRODMODE =', PRODMODE);
			console.log('[useSms] mock (входной):', mock);

			try {
				let responseData = [];

				if (!PRODMODE) {
					// DEV режим — берём из mock
					const mockData = typeof mock === 'function' ? mock() : mock;
					console.log('[useSms] mockData внутри:', mockData);

					const smsAll = Array.isArray(mockData?.content?.sms) ? mockData.content.sms : [];
					console.log('[useSms] smsAll from mockData.content.sms:', smsAll);

					// Приводим chatId к числу для безопасной фильтрации
					const targetId = chatId != null ? Number(chatId) : null;

					if (targetId != null) {
						const filtered = smsAll.filter((msg) => Number(msg.chat_id) === targetId);
						console.log('[useSms] filtered by chatId (mock):', filtered);
						responseData = filtered;
					} else {
						responseData = smsAll;
					}
				} else {
					// PRODMODE — делаем запрос к серверу
					const endpoint = chatId ? `/api/sms/${chatId}` : '/api/sms';
					const response = await PROD_AXIOS_INSTANCE.post(endpoint, {
						data: {},
						_token: CSRF_TOKEN,
					});

					console.log(`[useSms] Ответ от сервера (${endpoint}) =`, response.data);

					if (chatId) {
						if (Array.isArray(response.data.messages)) {
							responseData = response.data.messages;
						} else {
							console.warn(`[useSms] response.data.messages не массив для ${endpoint}`);
						}
					} else {
						const sms = response.data?.content?.sms;
						if (Array.isArray(sms)) {
							responseData = sms;
						} else {
							console.warn(`[useSms] content.sms не массив для ${endpoint}`);
						}
					}
				}

				setData(responseData);
			} catch (err) {
				console.error('[useSms] Ошибка в fetchData:', err);
				setError(err.message || 'Неизвестная ошибка');
				setData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [chatId, mock]);

	return { data, loading, error };
};
