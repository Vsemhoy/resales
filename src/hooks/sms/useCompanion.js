import { useCallback } from 'react';
// import { useUserData } from '../../hooks/utils/useUserData';
/**
 * Хук возвращает функцию, которая определяет собеседника в чате.
 * @param {number} currentUserId
 */
export const useCompanion = (currentUserId) => {
	return useCallback(
		(sms) => {
			if (typeof currentUserId !== 'number') {
				throw new Error('currentUserId должен быть числом');
			}
			if (!sms || !sms.from || !sms.to) return null;

			const { from, to } = sms;
			return from.id === currentUserId ? to : from;
		},
		[currentUserId]
	);
};
