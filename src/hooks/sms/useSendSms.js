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

	const sendSms = async ({ to, text, answer = null || false || true }) => {
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			if (!PRODMODE) {
				console.log('[useSendSms] Режим разработки — сообщение не отправляется');
				await new Promise((res) => setTimeout(res, 500));
				setSuccess(true);
				return { success: true, mock: true };
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
			console.log(to);
			// const response = await PROD_AXIOS_INSTANCE.post('/api/sms/create/sms', formData); // НЕ УДАЛЯТЬ
			const response = await PROD_AXIOS_INSTANCE.post('/api/sms/create/sms', formData);

			console.log('[useSendSms] Ответ от сервера:', response);

			if (response.status === 200) {
				setSuccess(true);
				return { success: true, data: response.data };
			} else {
				throw new Error('Сервер вернул некорректный статус: ' + response.status);
			}
		} catch (err) {
			console.error('[useSendSms] Ошибка:', err);

			let errorMessage = 'Ошибка при отправке сообщения';

			if (err.response) {
				const status = err.response.status;
				const serverMessage = err.response.data?.message || 'Неизвестная ошибка с сервера';

				if (status === 403) {
					errorMessage = 'Доступ запрещён: ' + serverMessage;
				} else if (status === 422) {
					// Validation errors
					const errors = err.response.data?.errors;
					errorMessage = errors ? Object.values(errors).flat().join(', ') : 'Ошибка валидации';
				} else {
					errorMessage = `Ошибка ${status}: ${serverMessage}`;
				}
			} else {
				errorMessage = err.message || 'Неизвестная ошибка';
			}

			setError(errorMessage);
			throw new Error(errorMessage);
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
