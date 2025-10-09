// context/ChatSocketContext.js
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const ChatSocketContext = createContext(null);

export const ChatSocketProvider = ({ children, url }) => {
	const socketRef = useRef(null);
	const [connected, setConnected] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState('disconnected');

	// Подписка на комнату (chatId на фронтенде = room на бэкенде)
	const subscribeToRoom = useCallback(
		(chatId) => {
			if (socketRef.current && connected) {
				console.log(`[Socket.io] Subscribing to room: ${chatId}`);
				socketRef.current.emit('subscribe', chatId);
			}
		},
		[connected]
	);

	// Подписка на список
	const subscribeToList = useCallback(
		(listId) => {
			if (socketRef.current && connected) {
				console.log(`[Socket.io] Subscribing to list: ${listId}`);
				socketRef.current.emit('subscribeToList', listId);
			}
		},
		[connected]
	);

	const connect = useCallback(() => {
		if (socketRef.current?.connected) {
			return;
		}

		console.log(`[Socket.io] Connecting to ${url}`);
		setConnectionStatus('connecting');

		try {
			// Создаем Socket.io клиент - ВАЖНО: без префикса ws://
			const socket = io(url, {
				transports: ['websocket', 'polling'],
				withCredentials: true,
			});

			socketRef.current = socket;

			socket.on('connect', () => {
				console.log('[Socket.io] ✅ Connected successfully');
				setConnected(true);
				setConnectionStatus('connected');
			});

			socket.on('disconnect', (reason) => {
				console.log(`[Socket.io] ❌ Disconnected:`, reason);
				setConnected(false);
				setConnectionStatus('disconnected');
			});

			socket.on('connect_error', (error) => {
				console.error('[Socket.io] 🚨 Connection error:', error);
				setConnectionStatus('error');
			});

			// Обработка входящих событий от BFF
			socket.on('new_message', (data) => {
				console.log('[Socket.io] 📨 Received new_message:', data);
				// Здесь будет логика обновления UI
			});

			socket.on('update_message', (data) => {
				console.log('[Socket.io] 📨 Received update_message:', data);
			});

			socket.on('status_update', (data) => {
				console.log('[Socket.io] 📨 Received status_update:', data);
			});

			// Общий обработчик для отладки
			socket.onAny((eventName, ...args) => {
				console.log(`[Socket.io] 🔍 Received event "${eventName}":`, args);
			});
		} catch (error) {
			console.error('[Socket.io] 🚨 Connection failed:', error);
			setConnectionStatus('error');
		}
	}, [url]);

	useEffect(() => {
		connect();

		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		};
	}, [connect]);

	const value = {
		connected,
		connectionStatus,
		subscribeToRoom,
		subscribeToList,
		reconnect: connect,
	};

	return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>;
};

export const useChatSocket = () => {
	const context = useContext(ChatSocketContext);
	if (!context) {
		throw new Error('useChatSocket must be used within ChatSocketProvider');
	}
	return context;
};
