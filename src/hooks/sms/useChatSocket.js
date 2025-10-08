import { useEffect, useRef } from 'react';
import { PRODMODE, BFF_PORT } from '../../config/config';
import io from 'socket.io-client';

const getWebSocketUrl = () => {
	const host = PRODMODE ? '192.168.1.16' : 'localhost';
	return `http://${host}:${BFF_PORT}`; // Важно: HTTP для Socket.io!
};

export const useChatSocket = ({ chatId, onNewMessage }) => {
	const socketRef = useRef(null);

	useEffect(() => {
		if (!chatId) return;

		const socketUrl = getWebSocketUrl();
		console.log(`[useChatSocket] Connecting to Socket.io: ${socketUrl}`);

		// Создаем Socket.io подключение
		socketRef.current = io(socketUrl, {
			transports: ['websocket', 'polling'],
			withCredentials: true,
		});

		// Обработчики событий Socket.io
		socketRef.current.on('connect', () => {
			console.log('[useChatSocket] ✅ Socket.io connected, ID:', socketRef.current.id);

			// Подписываемся на комнату чата
			socketRef.current.emit('subscribe', chatId);
			console.log(`[useChatSocket] Subscribed to room: ${chatId}`);
		});

		// Обработчики событий от API routes
		socketRef.current.on('new_message', (data) => {
			console.log('[useChatSocket] 📨 Received new_message:', data);
			onNewMessage && onNewMessage(data);
		});

		socketRef.current.on('update_message', (data) => {
			console.log('[useChatSocket] ✏️ Received update_message:', data);
			// Обработать обновление сообщения
		});

		socketRef.current.on('edit_message', (data) => {
			console.log('[useChatSocket] 📝 Received edit_message:', data);
			// Обработать редактирование сообщения
		});

		socketRef.current.on('reply_message', (data) => {
			console.log('[useChatSocket] ↩️ Received reply_message:', data);
			// Обработать ответ на сообщение
		});

		socketRef.current.on('delete_message', (data) => {
			console.log('[useChatSocket] 🗑️ Received delete_message:', data);
			// Обработать удаление сообщения
		});

		socketRef.current.on('status_update', (data) => {
			console.log('[useChatSocket] 📊 Received status_update:', data);
			// Обработать обновление статуса (прочитано/доставлено)
		});

		// Дополнительные события
		socketRef.current.on('server_restart', (data) => {
			console.log('[useChatSocket] 🔄 Server restart notification:', data);
			// Уведомление о перезапуске сервера
		});

		socketRef.current.on('connect_error', (err) => {
			console.error('[useChatSocket] 🚨 Socket.io connection error:', err);
		});

		socketRef.current.on('disconnect', (reason) => {
			console.log('[useChatSocket] ❌ Socket.io disconnected:', reason);
		});

		// Cleanup при размонтировании компонента
		return () => {
			console.log('[useChatSocket] 🧹 Cleaning up Socket.io connection');
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		};
	}, [chatId, onNewMessage]);

	// Функция для отправки сообщений (если понадобится)
	const sendMessage = (messageData) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit('send_message', messageData);
		} else {
			console.warn('[useChatSocket] Socket not connected');
		}
	};

	return {
		connected: socketRef.current?.connected || false,
		socketId: socketRef.current?.id,
		sendMessage,
	};
};

// ВРЕМЕННАЯ ЗАГЛУШКА ДЛЯ MVP
// export const useChatSocket = () => {
//   return {
//     messages: [],
//     connected: false,
//     ws: null,
//     sendMessage: () => console.warn('WebSocket временно отключен для MVP'),
//   };
// };
