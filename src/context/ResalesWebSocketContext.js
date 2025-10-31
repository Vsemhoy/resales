import {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {PRODMODE} from "../config/config";
import {io} from "socket.io-client";
import {useUserData} from "./UserDataContext";

export const ResalesWebSocketContext = createContext(null);

export const ResalesWebSocketProvider = ({ children, url }) => {
    const { userdata } = useUserData();
    const userdataRef = useRef();
    userdataRef.current = userdata;
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    const eventHandlersRef = useRef(new Map());

    const connect = useCallback(() => {
        if (!PRODMODE) return;
        if (socketRef.current?.connected) {
            return;
        }

        const socket = io(url, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('RESALES WEBSOCKET CONNECTED')
            setConnected(true);
            setConnectionStatus('connected');

            eventHandlersRef.current.forEach((handlers, event) => {
                handlers.forEach(handler => {
                    socket.on(event, handler);
                });
            });
        });

        socket.on('disconnect', (reason) => {
            console.log('RESALES WEBSOCKET DISCONNECTED, reason:', reason);
            setConnected(false);
            setConnectionStatus('disconnected');
        });

        socket.on('connect_error', (error) => {
            console.log('RESALES WEBSOCKET CONNECT ERROR:', error.message);
            setConnectionStatus('error');
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('RESALES WEBSOCKET RECONNECTED after', attemptNumber, 'attempts');
            setConnected(true);
            setConnectionStatus('connected');
        });

        socket.on('reconnect_error', (error) => {
            console.log('RESALES WEBSOCKET RECONNECT ERROR:', error.message);
        });

        socket.on('reconnect_failed', () => {
            console.log('RESALES WEBSOCKET RECONNECT FAILED');
            setConnectionStatus('failed');
        });

    }, [url]);

    // Функция подписки на событие
    const subscribe = useCallback((event, handler) => {
        if (!socketRef.current) return;

        // Сохраняем обработчик
        if (!eventHandlersRef.current.has(event)) {
            eventHandlersRef.current.set(event, new Set());
        }
        eventHandlersRef.current.get(event).add(handler);

        // Подписываемся на событие
        socketRef.current.on(event, handler);

        // Функция отписки
        return () => {
            if (eventHandlersRef.current.has(event)) {
                const handlers = eventHandlersRef.current.get(event);
                handlers.delete(handler);
                socketRef.current?.off(event, handler);

                if (handlers.size === 0) {
                    eventHandlersRef.current.delete(event);
                }
            }
        };
    }, []);

    // Функция отправки сообщений
    const emit = useCallback((event, data) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn('WebSocket not connected, cannot emit:', event);
        }
    }, []);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            console.log('Manually disconnecting WebSocket');
            socketRef.current.disconnect();
        }
    }, []);

    useEffect(() => {
        if (userdata) {
            connect();

            return () => {
                console.log('WebSocketProvider cleanup - disconnecting');
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [userdata, connect]);

    useEffect(() => {
        return () => {
            console.log('WebSocketProvider unmounting - full cleanup');
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            eventHandlersRef.current.clear();
        };
    }, []);

    return (
        <ResalesWebSocketContext.Provider
            value={{
                connected,
                connectionStatus,
                subscribe,
                emit,
                disconnect,
                socket: socketRef.current
            }}
        >
            {children}
        </ResalesWebSocketContext.Provider>
    );
}

export const useWebSocket = () => {
    const context = useContext(ResalesWebSocketContext);
    if (!context) throw new Error('useWebSocket must be used within ResalesWebSocketProvider');
    return context;
};
