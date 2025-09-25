import { useEffect, useRef } from 'react';

export function useChatWebSocket({ userId, onMessage, path = '/chat' }) {
	const wsRef = useRef(null);

	useEffect(() => {
		if (!userId || wsRef.current) return;

		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
		const wsUrl = `${protocol}://${window.location.hostname}:5001${path}?userId=${userId}`;
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log('[WebSocket] Connected to', wsUrl);
		};

		ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);
				console.log('[WebSocket] Message received:', message);
				onMessage?.(message);
			} catch (e) {
				console.error('[WebSocket] Error parsing message:', e);
			}
		};

		ws.onerror = (error) => {
			console.error('[WebSocket] Error:', error);
		};

		ws.onclose = () => {
			console.warn('[WebSocket] Connection closed');
			wsRef.current = null;
		};

		return () => {
			wsRef.current?.close();
			wsRef.current = null;
		};
	}, [userId, onMessage, path]);
}
