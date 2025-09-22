import { useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';

export const useSendSms = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const sendSms = async (message) => {
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			if (!PRODMODE) {
				console.log('[useSendSms] Режим разработки — сообщение не отправляется');
				await new Promise((res) => setTimeout(res, 500));
				setSuccess(true);
				return;
			}

			const { to, text, answer } = message;

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
			} else {
				console.log('[useSendSms] Ошибка: статус ответа не OK');
				setError('Ошибка отправки сообщения');
			}
		} catch (err) {
			console.error('[useSendSms] Ошибка при отправке сообщения:', err);
			setError(err.message || 'Ошибка отправки сообщения');
		} finally {
			setLoading(false);
		}
	};

	return { sendSms, loading, error, success };
};
