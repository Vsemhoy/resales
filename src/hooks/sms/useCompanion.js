import { useCallback } from 'react';
import { useUserData } from '../../context/UserDataContext';

export const useCompanion = () => {
	const userdata = useUserData();
	const currentUserId = userdata.user.id;

	if (typeof currentUserId !== 'number') {
		throw new Error('currentUserId должен быть числом');
	}

	return useCallback(
		(sms) => {
			// Проверяем, что sms, from и to существуют
			if (!sms || !sms.from || !sms.to) return null;

			const { from, to } = sms;

			// Если id отправителя совпадает с currentUserId, возвращаем 'self', иначе 'buddy'
			if (from.id === currentUserId) {
				return 'self';
			} else if (to.id === currentUserId) {
				return 'buddy';
			}

			return null; // Если не совпадает ни с одним, возвращаем null
		},
		[currentUserId]
	);
};
