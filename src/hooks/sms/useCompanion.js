import { useCallback } from 'react';

export const useCompanion = (currentUserId) => {
	return useCallback(
		(sms) => {
			if (!sms || typeof sms.chat_id !== 'number') return null;

			if (sms.from.id === currentUserId && sms.to.id === currentUserId) {
				return 'self';
			}

			return sms.from.id === currentUserId ? sms.to : sms.from;
		},
		[currentUserId]
	);
};
