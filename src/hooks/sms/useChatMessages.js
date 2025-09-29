import { useMemo } from 'react';
import { useSms } from './useSms';
import { useChatSocket } from '../../context/ChatSocketContext';

export const useChatMessages = ({ chatId = null, mock = {} }) => {
	const { data: history, loading, error } = useSms({ chatId, mock });
	const { messages: liveMessages, connected } = useChatSocket();

	// --- фильтруем сообщения по chatId
	const filteredLiveMessages = useMemo(() => {
		return liveMessages
			.filter(
				(msg) =>
					msg.action === 'CHAT_MESSAGE' &&
					msg.payload &&
					(!chatId || msg.payload.chat_id === chatId)
			)
			.map((msg) => msg.payload);
	}, [liveMessages, chatId]);

	// --- объединяем историю и live-сообщения
	const allMessages = useMemo(() => {
		const map = new Map();
		(history || []).forEach((msg) => map.set(msg.id, msg));
		filteredLiveMessages.forEach((msg) => map.set(msg.id, msg));
		return Array.from(map.values()).sort((a, b) => {
			const aTime = a.updated_at || a.created_at;
			const bTime = b.updated_at || b.created_at;
			return aTime - bTime;
		});
	}, [history, filteredLiveMessages]);

	return {
		data: allMessages,
		loading,
		error: error,
		connected,
	};
};
