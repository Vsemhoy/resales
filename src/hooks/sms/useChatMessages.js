// hooks/sms/useChatMessages.js
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';
import { useState, useEffect, useCallback } from 'react';

export function useChatMessages({ chatId, mock = null }) {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const loadData = useCallback(
		async (signal) => {
			if (!chatId) {
				setData([]);
				setLoading(false);
				return;
			}

			setError(null);

			// DEV: используем мок
			if (!PRODMODE && mock) {
				try {
					const allSms = Array.isArray(mock?.content?.sms) ? mock.content.sms : [];
					const filtered = allSms.filter((msg) => msg.chat_id === parseInt(chatId));
					setData(filtered);
				} catch (e) {
					console.error('[useChatMessages] Ошибка мок-данных:', e);
					setError('Ошибка мок-данных');
					setData([]);
				} finally {
					setLoading(false);
				}
				return;
			}

			// PROD: запрашиваем сообщения конкретного чата
			try {
				const response = await PROD_AXIOS_INSTANCE.post(
					`/api/sms/${chatId}`, // Ручка для конкретного чата
					{ _token: CSRF_TOKEN },
					{ signal }
				);

				const payload = response?.data ?? {};
				const chatSms = Array.isArray(payload?.content?.sms) ? payload.content.sms : [];

				console.log(`[useChatMessages] Загружено ${chatSms.length} сообщений для чата ${chatId}`);
				setData(chatSms);
			} catch (err) {
				const isAbort = err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED';
				if (!isAbort) {
					console.error(`[useChatMessages] Ошибка для чата ${chatId}:`, err);
					setError(`Не удалось загрузить сообщения чата`);
					setData([]);
				}
			} finally {
				if (!signal?.aborted) setLoading(false);
			}
		},
		[chatId, mock]
	);

	// Первоначальная загрузка
	useEffect(() => {
		const controller = new AbortController();
		loadData(controller.signal);
		return () => controller.abort();
	}, [loadData]);

	return {
		data,
		loading,
		error,
		refetch: () => loadData(),
	};
}
