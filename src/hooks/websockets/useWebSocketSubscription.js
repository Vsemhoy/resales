import {useWebSocket} from "../../context/ResalesWebSocketContext";
import {useEffect, useRef} from "react";

export const useWebSocketSubscription = (event, handler, dependencies = []) => {
    const { subscribe, connected } = useWebSocket();
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!connected || !event || !handler) return;

        const unsubscribe = subscribe(event, (...args) => {
            handlerRef.current?.(...args);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [event, connected, ...dependencies]);
};
