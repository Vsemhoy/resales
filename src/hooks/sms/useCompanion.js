// TODO: Переписать, когда будет адекватная логика получения чата
import { useState, useEffect } from 'react';

// Хук для определения роли пользователя
export const useCompanion = (currentUserId, chatData) => {
	const [isCompanion, setIsCompanion] = useState(false);

	useEffect(() => {
		if (!currentUserId || !chatData) return;

		// Логика определения роли
		const checkRole = () => {
			// Пример 1: Если в чате есть поле participants
			if (chatData.participants) {
				const currentUser = chatData.participants.find(
					(participant) => participant.id === currentUserId
				);
				return currentUser?.role === 'companion';
			}

			// Пример 2: Если чат имеет создателя
			if (chatData.creatorId) {
				return chatData.creatorId !== currentUserId;
			}

			// Пример 3: Простая проверка по ID
			return chatData.companionId === currentUserId;
		};

		setIsCompanion(checkRole());
	}, [currentUserId, chatData]);

	return isCompanion;
};
