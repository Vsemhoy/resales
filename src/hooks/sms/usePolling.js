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
		if (!enabled || interval <= 0) {
			// Если polling отключен, очищаем существующий интервал
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		let isMounted = true;
		let isFetching = false;

		const executePolling = async () => {
			if (!isMounted || isFetching) return;

			isFetching = true;
			try {
				// console.log(`[usePolling] Executing polling callback (interval: ${interval}ms)`);
				await callbackRef.current();
			} catch (error) {
				console.error('[usePolling] Ошибка в callback:', error);
			} finally {
				if (isMounted) {
					isFetching = false;
				}
			}
		};

		// Запускаем сразу при монтировании
		console.log(`[usePolling] Starting polling with ${interval}ms interval`);
		executePolling();

		// Устанавливаем интервал
		intervalRef.current = setInterval(executePolling, interval);

		return () => {
			console.log(`[usePolling] Cleaning up polling`);
			isMounted = false;
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [interval, enabled]);
}
