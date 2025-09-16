import { useCallback } from 'react';
/**
 * Хук возвращает функцию, которая определяет собеседника в чате.
 * @param {number} currentUserId — ID текущего пользователя (клиента)
 */
export function useCompanion(currentUserId) {
	if (typeof currentUserId !== 'number') {
		throw new Error('currentUserId должен быть числом');
	}

	return useCallback(
		(sms) => {
			if (!sms || !sms.from || !sms.to) return null;

			const { from, to } = sms;

			// Если ты отправил сообщение — собеседник to
			// Если тебе отправили — собеседник from
			return from.id === currentUserId ? to : from;
		},
		[currentUserId]
	);
}
