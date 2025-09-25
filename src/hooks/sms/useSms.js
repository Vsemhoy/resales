import { useState, useEffect } from 'react';
import { PRODMODE } from '../../config/config';

export function useSms({ chatId = null, mock = null }) {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError(null);

			// Если не PRODMODE и передан mock — используем мок-данные
			if (!PRODMODE && mock) {
				try {
					const allSms = mock?.content?.sms || [];
					const filtered = chatId ? allSms.filter((msg) => msg.chat_id === chatId) : allSms;
					setData(filtered);
				} catch (e) {
					console.error('[useSms] Ошибка при разборе мок-данных:', e);
					setError('Ошибка при загрузке мок-данных');
				} finally {
					setLoading(false);
				}
				return;
			}

			// В PRODMODE — фетчим с сервера
			try {
				const url = chatId ? `/api/sms?chatId=${chatId}` : '/api/sms';
				const response = await fetch(url);

				if (!response.ok) throw new Error('Ошибка при загрузке данных');
				const json = await response.json();

				const allSms = json?.content?.sms || [];
				const filtered = chatId ? allSms.filter((msg) => msg.chat_id === chatId) : allSms;
				setData(filtered);
			} catch (err) {
				console.error('[useSms] Ошибка:', err);
				setError('Не удалось загрузить сообщения');
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [chatId, mock]);

	return {
		data,
		loading,
		error,
	};
}
