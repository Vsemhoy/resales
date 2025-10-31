import {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {ChatSocketContext} from "./ChatSocketContext";
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

    const connect = useCallback(() => {
        if (!PRODMODE) return;
        if (socketRef.current?.connected) {
            return;
        }
        const socket = io(url, { transports: ['websocket', 'polling'], withCredentials: true });
        socketRef.current = socket;
        // --- подключение к ws и подписка ---
        socket.on('connect', () => {
            console.log('WEBSOCKET CONNECTED')
            setConnected(true);
            setConnectionStatus('connected');
            //const userId = userdataRef.current?.user?.id;
            //socket.emit('subscribeToChat', userId);
        });
        // --- получаем новое сообщение ---
        socket.on('new:sms', (data) => {

        });
        socket.on('update:sms', (data) => {

        });
        socket.on('disconnect', (reason) => {
            console.log('WEBSOCKET DISCONNECTED');
            setConnected(false);
            setConnectionStatus('disconnected');
        });
        socket.on('connect_error', (error) => {
            console.log('WEBSOCKET CONNECT ERROR');
        });
    }, [url]);

    useEffect(() => {
        if (userdata) {
            connect();
            return () => socketRef.current?.disconnect();
        }
    }, [userdata, connect]);

    return (
        <ResalesWebSocketContext.Provider
            value={{

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
