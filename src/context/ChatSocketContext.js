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
	const chatsRef = useRef();
	chatsRef.current = chats;
	const [currentChatId, setCurrentChatId] = useState(0); // открытый чат

	const [loadingChatList, setLoadingChatList] = useState(false); // ожидаем ответа со списком чатов
	const [loadingChat, setLoadingChat] = useState(false); // ожидаем ответа с чатом
	const [loadingSendSms, setLoadingSendSms] = useState(false); // ожидаем ответа при отправке сообщения


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
			console.log('WS new:sms', data);

			addMessageToChat(data.right);

			emitToListeners('message:new', data.right);
			emitToListeners('new:sms', data);
		});
		socket.on('disconnect', (reason) => {
			console.log('WEBSOCKET DISCONNECTED');
			setConnected(false);
			setConnectionStatus('disconnected');
		});
		socket.on('connect_error', (error) => {
			console.log('WEBSOCKET CONNECT ERROR');
		});
	}, [url, emitToListeners]);

	useEffect(() => {
		if (userdata) {
			connect();
			return () => {
				socketRef.current?.disconnect();
			};
		}
	}, [userdata, connect]);
	useEffect(() => {
		chatsRef.current = chats;
	}, [chats]);

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

	const sendSms = useCallback(async ({ to, text, answer, timestamp }) => {
		const localMsg = {
			from_id: userdata?.user?.id,
			id: timestamp,
			text: text,
			created_at: timestamp,
			updated_at: timestamp,
			answer: null,
			isLocal: true,
			isSending: true,
		};
		addMessageToChat(localMsg, to);
		setLoadingSendSms(true);
		try {
			const formData = new FormData();
			formData.append('_token', CSRF_TOKEN);
			formData.append(
				'data',
				JSON.stringify({
					to,
					text,
					answer,
					timestamp,
				})
			);
			console.log(to);
			const response = await PROD_AXIOS_INSTANCE.post('/api/sms/create/sms', formData);

			console.log('[useSendSms] Ответ от сервера:', response);

			if (response.data) {
				setSuccessSendSms(true);
				setNewId(response.data.id);
				setTimestamp(response.data.timestamp);
			}
		} catch (err) {
			console.error('[useSendSms] Ошибка:', err);
		} finally {
			setLoadingSendSms(false);
		}
	}, [loadingSendSms]);

	const setChatsPrepare = (newChat) => {
		if (!chats.find(chat => +chat.id === +newChat.id)) {
			setChats([...chats, newChat]);
		}
	};

	const addMessageToChat = (msg, to = null) => {
		const currentChats = chatsRef.current;
		const chatsUpd = [...currentChats];
		let chatIndex = -1;
		if (to) {
			chatIndex = chatsUpd.findIndex(chat => chat.chat_id === to);
		} else {
			chatIndex = chatsUpd.findIndex(chat => chat.chat_id === msg.from_id);
		}
		if (chatIndex === -1) {
			console.log('Chat not found, might need to fetch chats list');
			return;
		}
		const updatedChat = {
			...chatsUpd[chatIndex],
			messages: [...chatsUpd[chatIndex].messages, msg]
		};
		chatsUpd[chatIndex] = updatedChat;
		setChats(chatsUpd);
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
				loadingSendSms,
				/* methods */
				fetchChatsList,
				fetchChatMessages,  /*const {messages,who,loading} = useSms({chatId,mock: CHAT_MOCK});*/
				sendSms,
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
