import { MOCK } from './mock';

export const transformMessages = (mockData = MOCK) => {
	if (!Array.isArray(mockData)) return [];

	const smsList = mockData.flatMap((entry) => entry?.content?.sms || []);

	return smsList.map((sms) => ({
		id: sms.id,
		chatId: sms.chat_id,
		username: typeof sms.from === 'string' ? sms.from : `${sms.from.name} ${sms.from.surname}`,
		to: sms.to,
		text: sms.text,
		timestamp: sms.created_at * 1000,
		status: sms.status,
	}));
};

export { MOCK as MOCK_MESSAGES };
