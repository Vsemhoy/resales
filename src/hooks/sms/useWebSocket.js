import { useEffect, useRef, useCallback } from 'react';

export const useWebSocket = ({ url, userdata, onMessage, logPrefix = 'WS' }) => {
	const socketRef = useRef(null);
	const userRef = useRef(userdata);

	useEffect(() => {
		userRef.current = userdata;
	}, [userdata]);

	const handleMessage = useCallback(
		(event) => {
			try {
				const message = JSON.parse(event.data);
				onMessage && onMessage(message, userRef.current);
			} catch (err) {
				console.error(`[${logPrefix}] Ошибка парсинга сообщения:`, err);
			}
		},
		[onMessage, logPrefix]
	);

	useEffect(() => {
		if (!userdata || socketRef.current) return;

		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
		const wsUrl = `${protocol}://${url}`;

		const socket = new WebSocket(wsUrl);
		socketRef.current = socket;

		socket.onopen = () => console.log(`[${logPrefix}] Подключение установлено: ${wsUrl}`);
		socket.onmessage = handleMessage;
		socket.onerror = (err) => {
			console.error(`[${logPrefix}] Ошибка соединения:`, err);
			socket.close();
			socketRef.current = null;
		};
		socket.onclose = () => {
			console.log(`[${logPrefix}] Соединение закрыто`);
			socketRef.current = null;
		};

		return () => {
			socketRef.current?.close();
			socketRef.current = null;
		};
	}, [userdata, handleMessage, url, logPrefix]);

	return socketRef;
};
