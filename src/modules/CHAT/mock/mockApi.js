import { MOCK } from './mock.js';

export const mockApi = {
	getMessages() {
		return Promise.resolve(MOCK.content.sms);
	},

	postMessage(newMsg) {
		const msg = {
			...newMsg,
			id: Date.now(),
			created_at: Date.now(),
			updated_at: Date.now(),
		};
		MOCK.content.sms.push(msg);
		return Promise.resolve(msg);
	},

	markAsRead(chatId) {
		MOCK.content.sms.forEach((m) => {
			if (m.chat_id === chatId) m.status = true;
		});
		return Promise.resolve(true);
	},
};
