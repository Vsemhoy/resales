import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const ChatSocketContext = createContext(null);

export const ChatSocketProvider = ({ children, url }) => {
	const wsRef = useRef(null);
	const reconnectTimer = useRef(null);
	const reconnectAttempts = useRef(0);
	const maxReconnectAttempts = 5;

	const [connected, setConnected] = useState(false);
	const [messages, setMessages] = useState([]);
	const [connectionStatus, setConnectionStatus] = useState('disconnected');

	// Функция отправки сообщения через ref (работает всегда)
	const sendMessage = useCallback((data) => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(data));
			console.log('[WS] Sent:', data);
		} else {
			console.warn('[WS] Cannot send - socket not ready');
		}
	}, []);

	const connect = useCallback(() => {
		if (
			wsRef.current?.readyState === WebSocket.OPEN ||
			wsRef.current?.readyState === WebSocket.CONNECTING
		) {
			return;
		}

		if (reconnectAttempts.current >= maxReconnectAttempts) {
			console.warn('[WS] Max reconnection attempts reached');
			setConnectionStatus('failed');
			return;
		}

		console.log(`[WS] Connecting to ${url} (attempt ${reconnectAttempts.current + 1})`);
		setConnectionStatus('connecting');

		// Получаем CSRF токен из meta тега
		const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

		// Создаем URL с токеном в query параметрах
		const urlWithAuth = `${url}?csrf_token=${encodeURIComponent(csrfToken || '')}`;

		console.log('[WS] Connecting with CSRF token:', csrfToken ? 'yes' : 'no');

		try {
			const ws = new WebSocket(urlWithAuth);
			wsRef.current = ws;

			ws.onopen = () => {
				console.log('[WS] ✅ Connected successfully');
				setConnected(true);
				setConnectionStatus('connected');
				reconnectAttempts.current = 0;
			};

			ws.onclose = (event) => {
				console.log(`[WS] ❌ Closed:`, event.code, event.reason);
				setConnected(false);
				setConnectionStatus('disconnected');
				wsRef.current = null;

				reconnectAttempts.current++;

				if (!reconnectTimer.current && reconnectAttempts.current < maxReconnectAttempts) {
					const delay = Math.min(3000 * reconnectAttempts.current, 15000);
					console.log(`[WS] Reconnecting in ${delay}ms...`);
					reconnectTimer.current = setTimeout(() => {
						reconnectTimer.current = null;
						connect();
					}, delay);
				}
			};

			ws.onerror = (error) => {
				console.error('[WS] 🚨 Error:', error);
				setConnectionStatus('error');
			};

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					console.log('[WS] 📨 Received:', data);

					// Добавляем все сообщения в стейт для отладки
					setMessages((prev) => [data, ...prev]);
				} catch (e) {
					console.error('[WS] Message parse error:', e);
				}
			};
		} catch (error) {
			console.error('[WS] 🚨 Connection failed:', error);
			setConnectionStatus('error');
		}
	}, [url]);

	useEffect(() => {
		connect();

		return () => {
			if (reconnectTimer.current) {
				clearTimeout(reconnectTimer.current);
				reconnectTimer.current = null;
			}
			if (wsRef.current) {
				wsRef.current.close();
				wsRef.current = null;
			}
		};
	}, [connect]);

	const value = {
		connected,
		messages,
		sendMessage,
		connectionStatus,
		reconnect: () => {
			reconnectAttempts.current = 0;
			if (wsRef.current) {
				wsRef.current.close();
			} else {
				connect();
			}
		},
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
