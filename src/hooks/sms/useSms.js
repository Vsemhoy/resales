// hooks/sms/useSms.js
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';
import { useState, useEffect, useCallback } from 'react';

/**
 * useSms БЕЗ встроенного polling
 */
export function useSms({ chatId = null, mock = null }) {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// useCallback чтобы функция не пересоздавалась на каждом рендере
	const loadData = useCallback(
		async (signal) => {
			setError(null);

			// DEV: используем мок, если он передан
			if (!PRODMODE && mock) {
				try {
					const allSms = Array.isArray(mock?.content?.sms)
						? mock.content.sms
						: Array.isArray(mock?.sms)
						? mock.sms
						: [];
					const filtered = chatId ? allSms.filter((msg) => msg.chat_id === chatId) : allSms;
					setData(filtered);
				} catch (e) {
					console.error('[useSms] Ошибка при разборе мок-данных:', e);
					setError('Ошибка при загрузке мок-данных');
					setData([]);
				} finally {
					setLoading(false);
				}
				return;
			}

			// PROD: запрашиваем у бекенда
			try {
				const response = await PROD_AXIOS_INSTANCE.post(
					'/api/sms',
					{ _token: CSRF_TOKEN },
					{ signal }
				);

				const payload = response?.data ?? {};
				const allSms = Array.isArray(payload?.content?.sms)
					? payload.content.sms
					: Array.isArray(payload?.sms)
					? payload.sms
					: Array.isArray(payload?.data?.sms)
					? payload.data.sms
					: Array.isArray(payload)
					? payload
					: [];

				const filtered = chatId ? allSms.filter((msg) => msg.chat_id === chatId) : allSms;
				setData(filtered);
			} catch (err) {
				const isAbort = err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED';
				if (!isAbort) {
					console.error('[useSms] Ошибка при запросе сообщений:', err);
					setError('Не удалось загрузить сообщения');
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

		return () => {
			controller.abort();
		};
	}, [loadData]);

	return {
		data,
		loading,
		error,
		refetch: () => loadData(),
	};
}
