import { useEffect, useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';

export const useChatMessages = ({ chatId, mock = {} }) => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!chatId) return;

		const fetchMessages = async () => {
			setLoading(true);
			setError(null);

			try {
				let responseData = [];

				if (PRODMODE) {
					try {
						const response = await PROD_AXIOS_INSTANCE.post(`/api/sms/${chatId}`, {
							data: {},
							_token: CSRF_TOKEN,
						});

						console.log('[useChatMessages] Ответ от сервера:', response.data);

						const sms = response?.data?.content?.sms;

						if (Array.isArray(sms)) {
							responseData = sms;
						} else {
							console.warn('[useChatMessages] СМС в ответе сервера не является массивом');
						}
					} catch (err) {
						console.error(`[useChatMessages] Ошибка при запросе /api/sms/${chatId}:`, err);
						throw new Error('Не удалось загрузить сообщения чата');
					}
				} else {
					console.log('[useChatMessages] Используются MOCK-данные (dev mode)');
					const mockData = typeof mock === 'function' ? mock() : mock;

					const sms = mockData?.content?.sms;

					if (Array.isArray(sms)) {
						responseData = sms.filter((msg) => msg.chat_id === chatId);
					}
				}

				setData(responseData);
			} catch (err) {
				console.error('[useChatMessages] Ошибка при загрузке:', err);
				setError(err.message || 'Неизвестная ошибка');
				setData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchMessages();
	}, [chatId, mock]);

	return { data, loading, error };
};
