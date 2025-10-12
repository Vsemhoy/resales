import { useEffect, useState, useCallback } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';

export const useSms = ({ mock = {}, search }) => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [who, setWho] = useState(null);
	const [chatId, setChatId] = useState(null);

	const fetchData = useCallback(async () => {
		console.log(`[useSms] Загрузка данных для чата: ${chatId || 'список'}`);
		setLoading(true);
		setError(null);
		setWho(null);
		setChatId(null);

		try {
			let responseData = [];

			if (PRODMODE) {
				try {
					const endpoint = chatId ? `/api/sms/${chatId}` : '/api/sms';
					const response = await PROD_AXIOS_INSTANCE.post(endpoint, {
						data: { search },
						_token: CSRF_TOKEN,
					});

					const sms = chatId ? response?.data?.content?.messages : response?.data?.content?.sms;

					if (chatId) {
						setWho(response?.data?.content?.who);
					}

					if (Array.isArray(sms)) {
						responseData = sms;
					} else {
						console.warn(`[useSms] СМС в ответе сервера по ${endpoint} не является массивом`);
						responseData = [];
					}
				} catch (err) {
					console.error(
						`[useSms] Ошибка при запросе ${chatId ? `/api/sms/${chatId}` : '/api/sms'}:`,
						err
					);
					throw new Error('Не удалось загрузить SMS с сервера');
				}
			} else {
				const mockData = mock;
				const sms = chatId ? mockData?.content?.messages : mockData?.content?.sms;

				if (chatId) setWho('Собеседник');

				if (Array.isArray(sms)) {
					responseData = sms;
				} else {
					console.warn('[useSms] MOCK-данные не содержат массив sms');
					responseData = [];
				}
			}

			console.log('[useSms] Установка данных:', responseData);
			setData(responseData);
		} catch (err) {
			console.error('[useSms] Ошибка при загрузке данных:', err);
			setError(err.message || 'Неизвестная ошибка');
			setData([]);
		} finally {
			setLoading(false);
		}
	}, [chatId, mock, search]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Возвращаем только данные, без refetch
	return { data, who, loading, error, chatId };
};
