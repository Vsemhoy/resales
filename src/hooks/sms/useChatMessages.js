import { useMemo } from 'react';
import { useSms } from './useSms';
// import { useChatSocket } from '../../context/ChatSocketContext'; // ЗАКОММЕНТИРОВАТЬ

export const useChatMessages = ({ chatId = null, mock = {} }) => {
	// ВКЛЮЧАЕМ POLLING ДЛЯ АКТИВНЫХ ЧАТОВ
	const {
		data: history,
		loading,
		error,
		refetch,
	} = useSms({
		chatId,
		mock,
		enablePolling: !!chatId, // Polling только когда чат открыт
	});

	console.log('[useChatMessages] chatId:', chatId);
	console.log('[useChatMessages] SMS history loaded:', history?.length);

	const allMessages = useMemo(() => {
		const sorted = (history || []).sort((a, b) => {
			const aTime = a.updated_at || a.created_at;
			const bTime = b.updated_at || b.created_at;
			return aTime - bTime;
		});

		console.log('[useChatMessages] allMessages from HTTP:', sorted.length);
		return sorted;
	}, [history]);

	console.log('[useChatMessages] returning data:', allMessages.length);

	return {
		data: allMessages,
		loading,
		error: error,
		refetch, // ДОБАВЛЯЕМ ФУНКЦИЮ ДЛЯ РУЧНОГО ОБНОВЛЕНИЯ
	};
};
