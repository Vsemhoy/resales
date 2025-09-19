import { useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';

export const useSendSms = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const sendSms = async ({ to, text, answer = null }) => {
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			if (!PRODMODE) {
				console.log('[useSendSms] Режим разработки — сообщение не отправляется');
				// Имитация успешного ответа
				await new Promise((res) => setTimeout(res, 500));
				setSuccess(true);
				return;
			}

			const payload = {
				_token: CSRF_TOKEN,
				data: {
					to,
					text,
					answer,
				},
			};

			const response = await PROD_AXIOS_INSTANCE.post('/api/sms/create', payload);

			console.log('[useSendSms] Ответ от сервера:', response.data);

			if (response.data?.status === 'OK') {
				setSuccess(true);
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

	return {
		sendSms,
		loading,
		error,
		success,
	};
};
