import { useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';
import { nanoid } from 'nanoid';
import { useUserData } from '../../context/UserDataContext';

export const useSendSms = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	// Локальный буфер отправленных сообщений
	const [localSentMessages, setLocalSentMessages] = useState([]);

	const sendSms = async ({ to, text, answer = null }) => {
		setLoading(true);
		setError(null);
		setSuccess(false);

		// Локальное сообщение
		const newLocalMessage = {
			id: nanoid(),
			from: { id: currentUserId, name: 'Вы', surname: '' },
			to,
			chat_id: to,
			text,
			created_at: Math.floor(Date.now() / 1000),
			updated_at: Math.floor(Date.now() / 1000),
		};

		try {
			if (!PRODMODE) {
				console.log('[useSendSms] Режим разработки — сообщение не отправляется');
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

			const response = await PROD_AXIOS_INSTANCE.post('/api/sms/create/sms', formData);

			console.log('[useSendSms] Ответ от сервера:', response);

			if (response.status === 200) {
				setSuccess(true);
				setLocalSentMessages((prev) => [...prev, newLocalMessage]);
			} else {
				throw new Error('Сервер вернул некорректный статус: ' + response.status);
			}
		} catch (err) {
			console.error('[useSendSms] Ошибка:', err);

			// Axios error: если пришёл ответ, но с ошибкой (например, 403)
			if (err.response) {
				const status = err.response.status;
				const serverMessage = err.response.data?.message || 'Неизвестная ошибка с сервера';

				if (status === 403) {
					setError('Доступ запрещён: ' + serverMessage);
				} else {
					setError(`Ошибка ${status}: ${serverMessage}`);
				}
			} else {
				// Сетевая ошибка или что-то ещё
				setError(err.message || 'Неизвестная ошибка');
			}
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
