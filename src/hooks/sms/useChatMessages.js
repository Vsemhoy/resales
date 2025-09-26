import { useEffect, useState, useMemo } from 'react';
import { PRODMODE } from '../../config/config.js';
import { useSms } from './useSms';
import { useWebSocket } from './useWebSocket.js';

export const useChatMessages = ({ chatId = null, mock = {} }) => {
	const { data: history, loading, error } = useSms({ chatId, mock });
	const [liveMessages, setLiveMessages] = useState([]);
	const [wsError, setWsError] = useState(null);

	// Подключаем WebSocket только в PRODMODE
	useEffect(() => {
		if (!PRODMODE) {
			setLiveMessages([]);
			return;
		}
	}, []);

	useWebSocket({
		url: '192.168.1.16:5003',
		userdata: { chatId }, // можно пробрасывать chatId
		logPrefix: 'ChatWS',
		onMessage: (msg) => {

			try {
				if (msg.action === 'CHAT_MESSAGE' && msg.payload) {
					if (!chatId || msg.payload.chat_id === chatId) {
						setLiveMessages((prev) => [...prev, msg.payload]);
					}
				}
			} catch (e) {
				console.error('[useChatMessages] Ошибка парсинга:', e);
				setWsError('WebSocket parse error');
			}
		},
	});

	// объединяем историю и live
	const allMessages = useMemo(() => {
		const map = new Map();
		(history || []).forEach((msg) => map.set(msg.id, msg));
		liveMessages.forEach((msg) => map.set(msg.id, msg));
		return Array.from(map.values()).sort((a, b) => {
			const aTime = a.updated_at || a.created_at;
			const bTime = b.updated_at || b.created_at;
			return aTime - bTime;
		});
	}, [history, liveMessages]);

	return {
		data: allMessages,
		loading,
		error: error || wsError,
	};
};
