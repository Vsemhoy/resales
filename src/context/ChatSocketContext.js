import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const ChatSocketContext = createContext(null);

export const ChatSocketProvider = ({ children, url }) => {
	const wsRef = useRef(null);
	const reconnectTimer = useRef(null);

	const [connected, setConnected] = useState(false);
	const [messages, setMessages] = useState([]);

	// --- безопасная отправка сообщений
	const sendMessage = useCallback((data) => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(data));
		} else {
			console.warn('[WS] socket is not ready');
		}
	}, []);

	// --- создание сокета (с защитой от StrictMode)
	const connect = useCallback(() => {
		if (wsRef.current) return; // если уже есть соединение — выходим

		const ws = new WebSocket(url);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log('[WS] connected');
			setConnected(true);
		};

		ws.onclose = () => {
			console.log('[WS] closed');
			setConnected(false);
			wsRef.current = null;

			// авто-реconnect через 3 секунды
			if (!reconnectTimer.current) {
				reconnectTimer.current = setTimeout(() => {
					reconnectTimer.current = null;
					connect();
				}, 3000);
			}
		};

		ws.onerror = (err) => {
			console.error('[WS] error', err);
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				setMessages((prev) => [data, ...prev]); // новые сверху
			} catch (e) {
				console.error('[WS] message parse error', e);
			}
		};
	}, [url]);

	// --- подключение один раз
	useEffect(() => {
		connect();

		return () => {
			if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
			wsRef.current?.close();
			wsRef.current = null;
		};
	}, [connect]);

	return (
		<ChatSocketContext.Provider value={{ ws: wsRef.current, connected, messages, sendMessage }}>
			{children}
		</ChatSocketContext.Provider>
	);
};

export const useChatSocket = () => {
	const context = useContext(ChatSocketContext);
	if (!context) {
		throw new Error('useChatSocket must be used within ChatSocketProvider');
	}
	return context;
};
