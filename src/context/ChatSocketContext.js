import {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {io} from 'socket.io-client';
import {CSRF_TOKEN, PRODMODE} from '../config/config.js';
import {CHAT_LIST_MOCK, CHAT_MOCK, MOCK} from '../modules/CHAT/mock/mock.js';
import {useUserData} from "./UserDataContext";
import useSms from "../hooks/sms/useSms";
import {PROD_AXIOS_INSTANCE} from "../config/Api";


export const ChatSocketContext = createContext(null);

export const ChatSocketProvider = ({ children, url }) => {
	const socketRef = useRef(null);
	const [connected, setConnected] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState('disconnected');

	const { userdata } = useUserData();
	const userdataRef = useRef();
	userdataRef.current = userdata;

	const [chatsList, setChatsList] = useState([]); // боковой список чатов (последнее сообщение)
	const [chats, setChats] = useState([]); // все чаты
	const [currentChatId, setCurrentChatId] = useState(0); // открытый чат

	const [loadingChatList, setLoadingChatList] = useState(false); // сообщения по chatId
	const [loadingChat, setLoadingChat] = useState(false); // сообщения по chatId


	const [search, setSearch] = useState(false); // поиск по чатам


	const listeners = useRef({});

	// --- WS события ---
	const on = useCallback((event, handler) => {
		if (!listeners.current[event]) listeners.current[event] = new Set();
		listeners.current[event].add(handler);
	}, []);

	const off = useCallback((event, handler) => {
		listeners.current[event]?.delete(handler);
	}, []);

	const emitToListeners = useCallback((event, payload) => {
		listeners.current[event]?.forEach((h) => h(payload));
	}, []);

	const connect = useCallback(() => {
		/*if (!PRODMODE) {
			setConnected(true);
			setConnectionStatus('mock');

			// --- загружаем mock-чаты ---
			const mockChats = MOCK?.content?.sms || [];
			setChats(mockChats.map((sms) => ({ chat_id: sms.chat_id, ...sms })));

			// --- загружаем mock-сообщения по chatId ---
			const chatMessagesMap = {};
			mockChats.forEach((sms) => {
				const chatId = sms.chat_id;
				// берем из CHAT_MOCK все сообщения, относящиеся к этому чату
				chatMessagesMap[chatId] = (CHAT_MOCK?.content?.messages || [])
					.filter((msg) => msg.from_id === sms.from.id || msg.to?.id === sms.from.id)
					.map((msg) => ({...msg, chat_id: chatId}));
			});
			setMessages(chatMessagesMap);
			return;
		}*/
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
			const userId = userdataRef.current?.user?.id;
			if (!userId) {
				console.error('User ID is undefined');
				return;
			}
			socket.emit('subscribeToChat', userId);
		});
		// --- получаем новое сообщение ---
		socket.on('new:sms', (data) => {
			const msg = data.message;
			console.log('WS new:sms', data);
			/*setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				return {...prev, [msg.chat_id]: [...chatMsgs, msg]};
			});*/
			emitToListeners('message:new', msg);
			emitToListeners('new:sms', data);
		});
		socket.on('disconnect', (reason) => {
			console.log('WEBSOCKET DISCONNECTED')
			setConnected(false);
			setConnectionStatus('disconnected');
		});
		socket.on('connect_error', (error) => {
			console.log('WEBSOCKET CONNECT ERROR')
			//console.error('❌ WebSocket connection error:', error);
		});
		// Логируем все входящие события для отладки
		/*socket.onAny((eventName, ...args) => {
			// Особенно подробно логируем события от Laravel
			if (eventName.startsWith('sms:')) {

			}
		});*/
		// Логируем исходящие события
		/*const originalEmit = socket.emit.bind(socket);
		socket.emit = (event, ...args) => {
			return originalEmit(event, ...args);
		};*/
	}, [url, emitToListeners]);

	useEffect(() => {
		if (userdata) {
			connect();
			return () => {
				socketRef.current?.disconnect();
			};
		}
	}, [userdata, connect]);

	const fetchChatsList = useCallback(async () => {
		if (loadingChatList) return;
		setLoadingChatList(true);
		if (PRODMODE) {
			try {
				const endpoint = `/api/sms`;
				const response = await PROD_AXIOS_INSTANCE.post(endpoint, {
					data: {search},
					_token: CSRF_TOKEN,
				});
				if (response?.data?.content) {
					setChatsList(response?.data?.content?.sms);
				}
			} catch (err) {
				console.log(err);
			} finally {
				setLoadingChatList(false);
			}
		} else {
			setChatsList(CHAT_LIST_MOCK?.content?.sms);
			setLoadingChatList(false);
		}
	}, [loadingChatList]);

	const fetchChatMessages = useCallback(async (chatId) => {
		if (loadingChat) return;
		setLoadingChat(true);
		if (PRODMODE) {
			try {
				const endpoint = `/api/sms/${chatId}`;
				const response = await PROD_AXIOS_INSTANCE.post(endpoint, {
					_token: CSRF_TOKEN,
				});
				if (response?.data?.content) {
					setCurrentChatId(chatId);
					setChatsPrepare({
						chat_id: chatId,
						who: response?.data?.content?.who,
						messages: response?.data?.content?.messages,
						fist_message_id: 0,
						scrollHeight: 0,
					});
				}
			} catch (err) {
				console.log(err);
			} finally {
				setLoadingChat(false);
			}
		} else {
			setCurrentChatId(chatId);
			setChatsPrepare({
				chat_id: chatId,
				who: CHAT_MOCK?.content?.who,
				messages: CHAT_MOCK?.content?.messages,
				fist_message_id: 0,
				scrollHeight: 0,
			});
			setLoadingChat(false);
		}
	}, [loadingChat]);

	const setChatsPrepare = (newChat) => {
		if (!chats.find(chat => +chat.id === +newChat.id)) {
			setChats([...chats, newChat]);
		}
	};

	return (
		<ChatSocketContext.Provider
			value={{
				/* socket */
				on,
				off,
				connected,
				connectionStatus,
				/* chats info */
				chats,
				currentChatId,
				loadingChatList,
				loadingChat,
				/* methods */
				fetchChatsList,
				fetchChatMessages,  /*const {messages,who,loading} = useSms({chatId,mock: CHAT_MOCK});*/
			}}
		>
			{children}
		</ChatSocketContext.Provider>
	);
};

export const useChatSocket = () => {
	const context = useContext(ChatSocketContext);
	if (!context) throw new Error('useChatSocket must be used within ChatSocketProvider');
	return context;
};
