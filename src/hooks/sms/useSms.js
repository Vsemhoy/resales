import { useEffect, useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';

export const useSms = ({ chatId = null, mock = {}, search }) => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);

			console.log("ПИСЯ К НОСУ!!!!!!", search)

			try {
				let responseData = [];

				if (PRODMODE) {
					try {
						const endpoint = chatId ? `/api/sms/${chatId}` : '/api/sms';
						const response = await PROD_AXIOS_INSTANCE.post(endpoint, {
							data: {search},
							_token: CSRF_TOKEN,
						});

						console.log(`[useSms] Ответ от сервера (${endpoint}):`, response.data);

						const sms = response?.data?.content?.sms;

						if (Array.isArray(sms)) {
							responseData = sms;
						} else {
							console.warn(`[useSms] СМС в ответе сервера по ${endpoint} не является массивом`);
						}
					} catch (err) {
						console.error(
							`[useSms] Ошибка при запросе ${chatId ? `/api/sms/${chatId}` : '/api/sms'}:`,
							err
						);
						throw new Error('Не удалось загрузить SMS с сервера');
					}
				} else {
					console.log('[useSms] Используются MOCK-данные (dev mode)');

					// ИСПРАВЛЕНИЕ: убрал вызов mock как функции
					const mockData = mock; // Просто используем объект как есть

					console.log('[useSms] MOCK-данные:', mockData);

					// Для chatId можно расширить мок или фильтровать
					const sms = chatId
						? mockData?.content?.sms?.filter((msg) => msg.chat_id === chatId)
						: mockData?.content?.sms;

					if (Array.isArray(sms)) {
						responseData = sms;
					} else {
						console.warn('[useSms] MOCK-данные не содержат массив sms');
						responseData = []; // Устанавливаем пустой массив вместо undefined
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
		};

		fetchData();
	}, [chatId, mock, search]);

	return { data, loading, error };
};
