import { useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../config/Api.js';

export const useSendSms = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const sendSms = async (message) => {
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			if (PRODMODE) {
				await PROD_AXIOS_INSTANCE.post('/api/sms/send', {
					message,
					_token: CSRF_TOKEN,
				});
			} else {
				// Здесь можно сделать мок логику или пропустить вызов
				console.log('[useSendSms] MOCK отправка сообщения:', message);
			}
			setSuccess(true);
		} catch (err) {
			console.error('[useSendSms] Ошибка при отправке сообщения:', err);
			setError(err.message || 'Ошибка отправки сообщения');
		} finally {
			setLoading(false);
		}
	};

	return { sendSms, loading, error, success };
};
