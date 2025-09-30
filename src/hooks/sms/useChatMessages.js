import { useMemo } from 'react';
import { useSms } from './useSms';
import { useChatSocket } from '../../context/ChatSocketContext';

export const useChatMessages = ({ chatId = null, mock = {} }) => {
	const { data: history, loading, error } = useSms({ chatId, mock });
	const { messages: liveMessages, connected } = useChatSocket();

	console.log('[useChatMessages] chatId:', chatId);
	console.log('[useChatMessages] SMS history loaded:', history?.length);
	console.log('[useChatMessages] WS connected:', connected);
	console.log('[useChatMessages] total live messages received:', liveMessages.length);

	// --- фильтруем сообщения по chatId
	const filteredLiveMessages = useMemo(() => {
		const filtered = liveMessages
			.filter(
				(msg) =>
					msg.action === 'CHAT_MESSAGE' &&
					msg.payload &&
					(!chatId || msg.payload.chat_id === chatId)
			)
			.map((msg) => msg.payload);

		console.log(
			'[useChatMessages] filtered live messages for chatId',
			chatId,
			':',
			filtered.length
		);

		return filtered;
	}, [liveMessages, chatId]);

	// --- объединяем историю и live-сообщения
	const allMessages = useMemo(() => {
		const map = new Map();
		(history || []).forEach((msg) => map.set(msg.id, msg));
		filteredLiveMessages.forEach((msg) => map.set(msg.id, msg));

		const sorted = Array.from(map.values()).sort((a, b) => {
			const aTime = a.updated_at || a.created_at;
			const bTime = b.updated_at || b.created_at;
			return aTime - bTime;
		});

		console.log('[useChatMessages] allMessages combined & sorted:', sorted.length);
		return sorted;
	}, [history, filteredLiveMessages]);

	console.log('[useChatMessages] returning data:', allMessages.length);

	return {
		data: allMessages,
		loading,
		error: error,
		connected,
	};
};
