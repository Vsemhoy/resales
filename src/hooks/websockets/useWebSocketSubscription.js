import {useWebSocket} from "../../context/ResalesWebSocketContext";
import {useEffect} from "react";

export const useWebSocketSubscription = (event, handler, dependencies = []) => {
    const { subscribe, connected } = useWebSocket();

    useEffect(() => {
        if (!connected || !event || !handler) return;

        const unsubscribe = subscribe(event, handler);

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [event, connected, ...dependencies]);
};
