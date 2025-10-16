import { useState, useEffect } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../config/config.js';
import { PROD_AXIOS_INSTANCE } from '../../config/Api.js';

export default function useSms({ chatId, search, mock}) {
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
					}
					if (sms) {
						setMessages(sms);
					}
				} catch (err) {
					console.log(err);
				} finally {
					setLoading(false);
				}
			} else {
				const sms = chatId ? mock?.content?.messages : mock?.content?.sms;
				if (chatId) {
					setWho(mock?.content?.who);
				}
				if (sms) {
					setMessages(sms);
				}
				setLoading(false);
			}
		};

		fetchMessages().then();
	}, [chatId, search]);

	return { messages, loading, error, who };
}
