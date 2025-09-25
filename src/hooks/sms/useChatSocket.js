import { useEffect, useRef } from 'react';
import { PRODMODE } from '../../config/config.js';

const getWebSocketUrl = () => {
	if (!PRODMODE) {
		return 'ws://localhost:5003'; // для dev режима
	}
	return 'ws://192.168.1.16:5003'; // твой BFF WebSocket сервер
};

export const useChatSocket = ({ chatId, onNewMessage }) => {
	const ws = useRef(null);

	useEffect(() => {
		if (!chatId) return;

		ws.current = new WebSocket(getWebSocketUrl());

		ws.current.onopen = () => {
			console.log('[useChatSocket] WS connected');
			// Можно отправить приветственное сообщение, например подписку на chatId
			ws.current.send(JSON.stringify({ action: 'subscribe', chatId }));
		};

		ws.current.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				// Предположим, что сервер шлёт объект { type: 'new_message', payload: { ... } }
				if (data.type === 'new_message' && data.payload.chat_id === chatId) {
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
