import { useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';
import { nanoid } from 'nanoid';

export const useSendSms = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	// Локальный буфер отправленных сообщений
	const [localSentMessages, setLocalSentMessages] = useState([]);

	const sendSms = async ({ to, text, answer = null }) => {
		setLoading(true);
		setError(null);
		setSuccess(false);

		// Создаём локальное сообщение с уникальным id
		const newLocalMessage = {
			id: nanoid(),
			from: { id: 'self', name: 'Вы', surname: '' }, // можно адаптировать под данные пользователя
			to,
			chat_id: to,
			text,
			created_at: Math.floor(Date.now() / 1000),
			updated_at: Math.floor(Date.now() / 1000),
		};

		try {
			if (!PRODMODE) {
				console.log('[useSendSms] Режим разработки — сообщение не отправляется');
				// Имитация успешного ответа
				await new Promise((res) => setTimeout(res, 500));
				setSuccess(true);

				setLocalSentMessages((prev) => [...prev, newLocalMessage]);
				return;
			}

			const formData = new FormData();
			formData.append('_token', CSRF_TOKEN);
			formData.append(
				'data',
				JSON.stringify({
					to,
					text,
					answer,
				})
			);

			const response = await PROD_AXIOS_INSTANCE.post('/api/sms/create', formData);

			console.log('[useSendSms] Ответ от сервера:', response.data);

			if (response.data?.status === 'OK') {
				setSuccess(true);
				// Можно добавить здесь замену id на реальный из ответа сервера, если нужно
				setLocalSentMessages((prev) => [...prev, newLocalMessage]);
			} else {
				throw new Error(response.data?.message || 'Ошибка при отправке СМС');
			}
		} catch (err) {
			console.error('[useSendSms] Ошибка:', err);
			setError(err.message || 'Неизвестная ошибка');
		} finally {
			setLoading(false);
		}
	};

	const clearLocalMessages = () => setLocalSentMessages([]);

	return {
		sendSms,
		loading,
		error,
		success,
		localSentMessages,
		clearLocalMessages,
	};
};
