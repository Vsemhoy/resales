import {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {io} from 'socket.io-client';
import {CSRF_TOKEN, PRODMODE} from '../config/config.js';
import {CHAT_LIST_MOCK, CHAT_MOCK} from '../modules/CHAT/mock/mock.js';
import {useUserData} from "./UserDataContext";
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
	const chatsListRef = useRef();
	chatsListRef.current = chatsList;
	const [chats, setChats] = useState([]); // все чаты
	const chatsRef = useRef();
	chatsRef.current = chats;
	const [currentChatId, setCurrentChatId] = useState(0); // открытый чат

	const [loadingChatList, setLoadingChatList] = useState(false); // ожидаем ответа со списком чатов
	const [loadingChat, setLoadingChat] = useState(false); // ожидаем ответа с чатом
	const [loadingSendSms, setLoadingSendSms] = useState(false); // ожидаем ответа при отправке сообщения

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

			if (data.left) addMessageToChatList(data.left);
			if (data.right) addMessageToChat(data.right);

			if (data.right)  emitToListeners('message:new', data.right);
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
		console.log('BEFORE UPDATE CHATS chatsRef', chats);
		chatsRef.current = chats;
	}, [chats]);
	useEffect(() => {
		chatsListRef.current = chatsList;
	}, [chatsList]);

	const fetchChatsList = useCallback(async (search) => {
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

	const sendSms = useCallback(async ({ to, text, files, answer, timestamp, from_id }) => {
		insertMessagesToArrays(to, text, files, answer, timestamp, from_id);
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
			if (files && files.length > 0) {
				files.forEach((uploadFile) => {
					if (uploadFile.originFileObj) {
						formData.append('file[]', uploadFile.originFileObj);
					}
					/*else if (uploadFile.url) {
						console.log('Файл уже загружен:', uploadFile.url);
					}*/
				});
			}
			console.log(to);
			const response = await PROD_AXIOS_INSTANCE.post('/api/sms/create/sms', formData);

			console.log('[useSendSms] Ответ от сервера:', response);

			if (response.data) {
				updateMessageId(response.data.id, response.data.timestamp, response.data.files, to);
				addMessageToChatList(response.data.left);
			}
		} catch (err) {
			console.error('[useSendSms] Ошибка:', err);
		} finally {
			setLoadingSendSms(false);
		}
	}, [loadingSendSms]);

	const insertMessagesToArrays = (to, text, files, answer, timestamp, from_id) => {
		addMessageToChat({
			from_id: from_id,
			id: timestamp,
			text: text,
			files: files,
			created_at: timestamp,
			updated_at: timestamp,
			answer: null,
			isLocal: true,
			isSending: true,
		}, to);
	};

	const setChatsPrepare = (newChat) => {
		if (!chats.find(chat => +chat.chat_id === +newChat.chat_id)) {
			console.log('BEFORE UPDATE CHATS fetchChatMessages', chats);
			setChats(prevChats => [...prevChats, newChat]);
		}
	};
	const addMessageToChatList = (msg) => {
		setChatsList(prevChatsList => {
			const chatIndex = prevChatsList.findIndex(chat => chat.chat_id === msg.chat_id);
			if (chatIndex === -1) {
				return [
					prevChatsList[0],
					msg,
					...prevChatsList.slice(1)
				];
			} else {
				return prevChatsList.map((message, index) => {
					if (index === chatIndex) {
						return msg;
					}
					return message;
				});
			}
		});
	};
	const addMessageToChat = (msg, to = null) => {
		setChats(prevChats => {
			const chatIdToUpdate = to || msg.from_id;
			const chatIndex = prevChats.findIndex(chat => chat.chat_id === chatIdToUpdate);
			if (chatIndex === -1) {
				console.log('Chat not found, might need to fetch chats list');
				return prevChats;
			}
			return prevChats.map((chat, index) => {
				if (index === chatIndex) {
					return {
						...chat,
						messages: [...chat.messages, msg]
					};
				}
				return chat;
			});
		});
	};
	const updateMessageId = (id, timestamp, files, to) => {
		setChats(prevChats => {
			const chatIndex = prevChats.findIndex(chat => chat.chat_id === to);

			if (chatIndex === -1) {
				console.log('Chat not found, might need to fetch chats list');
				return prevChats;
			}

			return prevChats.map((chat, index) => {
				if (index === chatIndex) {
					const updatedMessages = chat.messages.map(message => {
						if (message.created_at === timestamp) {
							return {
								...message,
								id: id,
								isSending: false,
								files: files,
							};
						}
						return message;
					});
					return {
						...chat,
						messages: updatedMessages
					};
				}
				return chat;
			});
		});
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
				chatsList,
				chats,
				currentChatId,
				loadingChatList,
				loadingChat,
				loadingSendSms,
				/* methods */
				fetchChatsList,
				fetchChatMessages,
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
