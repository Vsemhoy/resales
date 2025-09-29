import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const ChatSocketContext = createContext(null);

export const ChatSocketProvider = ({ children, url }) => {
	const wsRef = useRef(null);
	const [connected, setConnected] = useState(false);
	const [messages, setMessages] = useState([]);

	// безопасная отправка
	const sendMessage = useCallback((data) => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(data));
		} else {
			console.warn('[WS] socket is not ready');
		}
	}, []);

	useEffect(() => {
		wsRef.current = new WebSocket(url);

		wsRef.current.onopen = () => {
			console.log('[WS] connected');
			setConnected(true);
		};

		wsRef.current.onclose = () => {
			console.log('[WS] closed');
			setConnected(false);
		};

		wsRef.current.onerror = (err) => {
			console.error('[WS] error', err);
		};

		wsRef.current.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				setMessages((prev) => [data, ...prev]); // складываем новые сообщения
			} catch (e) {
				console.error('[WS] message parse error', e);
			}
		};

		return () => {
			wsRef.current?.close();
		};
	}, [url]);

	return (
		<ChatSocketContext.Provider value={{ ws: wsRef.current, connected, messages, sendMessage }}>
			{children}
		</ChatSocketContext.Provider>
	);
};

export const useChatSocket = () => {
	const context = useContext(ChatSocketContext);
	if (!context) throw new Error('useChatSocket must be used within ChatSocketProvider');
	return context;
};
