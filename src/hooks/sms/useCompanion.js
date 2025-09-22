import { useCallback } from 'react';

/**
 * Хук возвращает объект собеседника относительно сообщения.
 * Если чат с самим собой — возвращает строку 'self'.
 * Иначе — объект пользователя, который не текущий пользователь.
 *
 * @param {number} currentUserId — ID текущего пользователя
 * @returns {(sms: object) => 'self' | {id, name, surname} | null}
 */
export const useCompanion = (currentUserId) => {
	return useCallback(
		(sms) => {
			if (typeof currentUserId !== 'number') {
				throw new Error('currentUserId должен быть числом');
			}
			if (!sms || typeof sms.chat_id !== 'number') return null;

			if (sms.from.id === currentUserId && sms.to.id === currentUserId) {
				return 'self'; // чат с самим собой
			}

			// возвращаем объект компаньона
			return sms.from.id === currentUserId ? sms.to : sms.from;
		},
		[currentUserId]
	);
};
