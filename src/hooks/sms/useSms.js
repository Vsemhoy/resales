import { useState, useEffect } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';

export default function useSms({ chatId, search }) {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [who, setWho] = useState(null);
	useEffect(() => {
		const fetchMessages = async () => {
			if (PRODMODE) {
				try {
					const endpoint = chatId ? `/api/sms/${chatId}` : '/api/sms';
					const response = await PROD_AXIOS_INSTANCE.post(endpoint, {
						data: { search },
						_token: CSRF_TOKEN,
					});

					const sms = chatId ? response?.data?.content?.messages : response?.data?.content?.sms;

					if (chatId) {
						setWho(response?.data?.content?.who);
						console.log(
							'[useSms] response?.data?.content?.who && sms && chatId: ',
							response?.data?.content?.who,
							sms,
							chatId
						);
					}
					if (sms) {
						setMessages(sms);
						console.log('[useSms] sms: ', sms);
					}
				} catch (err) {
					console.error(
						`[useSms] Ошибка при запросе ${chatId ? `/api/sms/${chatId}` : '/api/sms'}:`,
						err
					);
					throw new Error('Не удалось загрузить SMS с сервера');
				} finally {
					setLoading(false);
				}
			}
		};

		fetchMessages();
	}, [chatId, search]);

	return { messages, loading, error, who };
}
