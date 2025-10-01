// TODO: Переписать, когда будет адекватная логика получения чата
// import { useCallback } from 'react';

// export function useCompanion(currentUserId) {
// 	return useCallback(
// 		(message) => {
// 			if (!message || !currentUserId) return 'other';

// console.log('🔍 Message role check:', {
// 	messageId: message.id,
// 	fromId: message.from?.id,
// 	toId: message.to?.id,
// 	currentUserId,
// 	chatId: message.chat_id,
// });

// Если from.id равен текущему пользователю - это наше сообщение
// if (message.from?.id === currentUserId) {
// 	return 'self';
// }

// Если to.id равен текущему пользователю - это сообщение нам
// if (message.to?.id === currentUserId) {
// 	return 'other';
// }

// Дополнительная проверка по chat_id
// Если chat_id соответствует собеседнику, а from.id не нам - это сообщение от другого
// if (
// 	message.chat_id &&
// 	message.chat_id !== currentUserId &&
// 	message.from?.id !== currentUserId
// ) {
// 	return 'other';
// }

// 			return 'other'; // по умолчанию
// 		},
// 		[currentUserId]
// 	);
// }
