import { useEffect, useRef } from 'react';

/**
 * Универсальный хук для polling с защитой от race conditions
 */
export function usePolling(callback, interval = 30000, enabled = true) {
	const callbackRef = useRef(callback);
	const intervalRef = useRef(null);

	// Обновляем ref при изменении callback
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		if (!enabled || interval <= 0) return;

		let isMounted = true;
		let isFetching = false;

		const executePolling = async () => {
			if (!isMounted || isFetching) return;

			isFetching = true;
			try {
				await callbackRef.current();
			} catch (error) {
				console.error('[usePolling] Ошибка:', error);
			} finally {
				if (isMounted) {
					isFetching = false;
				}
			}
		};

		// Запускаем сразу при монтировании
		executePolling();

		// Устанавливаем интервал
		intervalRef.current = setInterval(executePolling, interval);

		return () => {
			isMounted = false;
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [interval, enabled]);
}
