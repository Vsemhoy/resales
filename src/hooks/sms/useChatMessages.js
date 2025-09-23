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
					const response = await PROD_AXIOS_INSTANCE.post(`/api/sms/${chatId}`, {
						data: {},
						_token: CSRF_TOKEN,
					});

					const messages = response?.data?.content?.messages;

					// 🔍 Логируем "сырые" данные с сервера
					console.log(`[useChatMessages] API /api/sms/${chatId} -> messages:`, messages);

					if (Array.isArray(messages)) {
						// Преобразуем, без добавления chat_id
						responseData = messages.map((msg) => ({
							id: msg.message_id,
							text: msg.text,
							created_at: msg.created_at,
							updated_at: msg.updated_at,
							from: { id: msg.from_id },
							// answer и to отсутствуют — не трогаем
						}));
					} else {
						console.warn('[useChatMessages] messages в API ответе не массив');
					}
				} else {
					console.log('[useChatMessages] Используются MOCK-данные');

					const mockData = typeof mock === 'function' ? mock() : mock;
					const sms = mockData?.content?.sms;

					if (Array.isArray(sms)) {
						responseData = sms
							.filter((msg) => msg.chat_id === chatId)
							.map((msg) => ({
								id: msg.id,
								text: msg.text,
								created_at: msg.created_at,
								updated_at: msg.updated_at,
								from: msg.from,
								to: msg.to,
							}));
					} else {
						console.warn('[useChatMessages] sms в MOCK не массив');
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
