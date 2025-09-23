import { useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import { nanoid } from 'nanoid';
import { useUserData } from '../../context/UserDataContext';

/**
 * Хук отправки SMS сообщений.
 * Возвращает функцию отправки, статус загрузки, ошибки и локальные сообщения.
 */
export const useSendSms = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const [localSentMessages, setLocalSentMessages] = useState([]);
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	/**
	 * Отправка сообщения на сервер (или локально в dev)
	 * @param {Object} param
	 * @param {number|string} param.to — ID собеседника
	 * @param {string} param.text — Текст сообщения
	 * @param {number|null} param.answer — ID сообщения, на которое ответ
	 */
	const sendSms = async ({ to, text, answer = null }) => {
		if (!to || !text?.trim()) return;
		if (!currentUserId) {
			setError('Пользователь не авторизован');
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(false);

		const timestamp = Math.floor(Date.now() / 1000);
		const newLocalMessage = {
			id: nanoid(),
			from: { id: currentUserId, name: 'Вы', surname: '' },
			to,
			chat_id: to,
			text: text.trim(),
			created_at: timestamp,
			updated_at: timestamp,
		};

		try {
			// 💻 Development mock
			if (!PRODMODE) {
				console.log('[useSendSms] Dev mode: message not actually sent');
				await new Promise((res) => setTimeout(res, 300));
				setSuccess(true);
				setLocalSentMessages((prev) => [...prev, newLocalMessage]);
				return;
			}

			// 🚀 Production mode: отправка JSON-запроса
			const payload = {
				_token: CSRF_TOKEN,
				data: {
					to,
					text: text.trim(),
					answer,
				},
			};

			console.log('[useSendSms] Отправка данных на сервер:', JSON.stringify(payload, null, 2));

			const response = await PROD_AXIOS_INSTANCE.post('/api/sms/create', payload, {
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.data?.status === 'OK') {
				setSuccess(true);
				setLocalSentMessages((prev) => [...prev, newLocalMessage]);
			} else {
				throw new Error(response.data?.message || 'Ошибка при отправке');
			}
		} catch (err) {
			console.error('[useSendSms] Ошибка:', err);
			setError(err?.message || 'Неизвестная ошибка');
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
