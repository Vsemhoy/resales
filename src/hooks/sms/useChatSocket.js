import { useEffect, useRef } from 'react';
// let chatId = 46; //ЗАГЛУШКА
const getWebSocketUrl = () => {
	// Всегда подключаемся к локальному BFF WebSocket серверу
	return 'ws://192.168.1.16:5003';
};

export const useChatSocket = ({ chatId, onNewMessage }) => {
	const ws = useRef(null);

	useEffect(() => {
		if (!chatId) return;

		ws.current = new WebSocket(getWebSocketUrl());

		ws.current.onopen = () => {
			console.log('[useChatSocket] WS connected');
			// Подписка на конкретный чат
			ws.current.send(JSON.stringify({ action: 'subscribe', chatId }));
		};

		ws.current.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.action === 'CHAT_MESSAGE' && data.payload?.chat_id === chatId) {
					onNewMessage && onNewMessage(data.payload);
				}
			} catch (e) {
				console.error('[useChatSocket] WS message parse error:', e);
			}
		};

		ws.current.onerror = (err) => {
			console.error('[useChatSocket] WS error:', err);
		};

		ws.current.onclose = () => {
			console.log('[useChatSocket] WS closed');
		};

		return () => {
			ws.current?.close();
		};
	}, [chatId, onNewMessage]);
};
