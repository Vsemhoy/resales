import { useEffect, useRef, useCallback } from 'react';
import { HTTP_HOST, PRODMODE } from '../../config/config';

export default function useMainWebSocket(userdata, onMessageHandler) {
	const socketRef = useRef(null);
	const userRef = useRef(userdata);

	useEffect(() => {
		userRef.current = userdata;
	}, [userdata]);

	const handleWebSocketMessage = useCallback(
		(event) => {
			try {
				const message = JSON.parse(event.data);
				if (onMessageHandler) {
					onMessageHandler(message, userRef.current);
				}
			} catch (error) {
				console.error('[WS:MAIN] Ошибка при разборе сообщения:', error);
			}
		},
		[onMessageHandler]
	);

	useEffect(() => {
		if (!userdata || socketRef.current) return;

		// Пример: ws://host:5001
		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
		const wsUrl = `${protocol}://${HTTP_HOST}:5001`;

		const socket = new WebSocket(wsUrl);
		socketRef.current = socket;

		socket.onopen = () => {
			console.log('[WS:MAIN] Подключение установлено:', wsUrl);
		};

		socket.onmessage = handleWebSocketMessage;

		socket.onerror = (err) => {
			console.error('[WS:MAIN] Ошибка соединения:', err);
			socket.close();
			socketRef.current = null;
		};

		socket.onclose = () => {
			console.log('[WS:MAIN] Соединение закрыто');
			socketRef.current = null;
		};

		return () => {
			if (socketRef.current) {
				socketRef.current.close();
				socketRef.current = null;
			}
		};
	}, [userdata, handleWebSocketMessage]);

	return socketRef;
}
