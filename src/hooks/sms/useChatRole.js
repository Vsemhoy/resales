import { useCallback } from 'react';

export const useChatRole = (currentUserId) => {
	// Функция определения роли пользователя в чате
	const getRole = useCallback(
		(sms) => {
			if (!sms || !currentUserId) return null;

			// Для сохраненного чата всегда возвращаем 'self'
			if (sms.isSavedChat || sms.chat_id === currentUserId) {
				return 'self';
			}

			// Основная логика определения роли
			return sms.from?.id === currentUserId ? 'self' : 'companion';
		},
		[currentUserId]
	);

	// Функция получения отображаемого имени
	const getDisplayName = useCallback((sms, role, isSaved = false) => {
		if (isSaved) return 'Сохранённое';

		const user = role === 'self' ? sms.to : sms.from;
		return `${user?.surname ?? ''} ${user?.name ?? ''}`.trim();
	}, []);

	return {
		getRole,
		getDisplayName,
	};
};
