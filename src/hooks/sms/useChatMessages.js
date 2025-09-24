import React, { useEffect, useState } from 'react';
import { PRODMODE } from '../../config/config.js';
import { useSms } from './useSms';

export const useChatMessages = ({ chatId = null, mock = {} }) => {
	const { data: history, loading, error } = useSms({ chatId, mock });
	const [liveMessages, setLiveMessages] = useState([]);
	const [wsError, setWsError] = useState(null);

	useEffect(() => {
		if (!PRODMODE) {
			// В dev режиме WS не нужен, сбрасываем live-сообщения
			setLiveMessages([]);
			return;
		}

		const ws = new WebSocket('wss://your-bff-server');

		ws.onopen = () => {
			ws.send(JSON.stringify({ action: 'subscribe', chatId }));
		};

		ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);

				if (msg.action === 'CHAT_MESSAGE' && msg.payload) {
					// Проверяем, что сообщение принадлежит нужному чату
					if (!chatId || msg.payload.chat_id === chatId) {
						setLiveMessages((prev) => [...prev, msg.payload]);
					}
				}
			} catch (e) {
				console.error('[useChatMessages] Ошибка парсинга WS сообщения:', e);
			}
		};

		ws.onerror = (error) => {
			console.error('[useChatMessages] WS ошибка:', error);
			setWsError('WebSocket error');
		};

		ws.onclose = () => {
			console.log('[useChatMessages] WS соединение закрыто');
		};

		return () => {
			ws.close();
		};
	}, [chatId]);

	// Объединяем историю и live-сообщения, убираем дубликаты по id
	const allMessages = React.useMemo(() => {
		if (!history) return liveMessages;

		const map = new Map();
		history.forEach((msg) => map.set(msg.id, msg));
		liveMessages.forEach((msg) => map.set(msg.id, msg));

		return Array.from(map.values()).sort((a, b) => a.created_at - b.created_at);
	}, [history, liveMessages]);

	// Для режима mock будем сразу возвращать мок-данные из useSms, liveMessages пустые
	// Для PRODMODE liveMessages добавляются из WS

	return {
		data: allMessages,
		loading,
		error: error || wsError,
	};
};
