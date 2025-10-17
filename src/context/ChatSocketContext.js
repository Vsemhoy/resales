import {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {io} from 'socket.io-client';
import {PRODMODE} from '../config/config.js';
import {CHAT_MOCK, MOCK} from '../modules/CHAT/mock/mock.js';
import {useUserData} from "./UserDataContext";


export const ChatSocketContext = createContext(null);

export const ChatSocketProvider = ({ children, url }) => {
	const socketRef = useRef(null);
	const [connected, setConnected] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState('disconnected');

	const { userdata } = useUserData();

	const [chats, setChats] = useState([]); // все чаты
	const [messages, setMessages] = useState({}); // сообщения по chatId

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

		if (!PRODMODE) {
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
		}

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
			socket.emit('subscribe', 'CHAT'); //userdata?.user?.id
		});
		socket.on('disconnect', (reason) => {
			console.log('WEBSOCKET DISCONNECTED')
			setConnected(false);
			setConnectionStatus('disconnected');
		});

		socket.on('connect_error', (error) => {
			console.log('WEBSOCKET CONNECT ERROR')
			console.error('❌ WebSocket connection error:', error);
		});

		// --- подписка на ws ---
		socket.on('chat:list:get', (payload) => {
			setChats(payload);
			emitToListeners('chat:list:get', payload);
		});

		// --- обработчики для API-событий (из Laravel) ---
		//socket.on('sms:new_message', (data) => {
		socket.on('new:sms', (data) => {
			const msg = data.message;
			console.log('WS new:sms', data);
			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				return {...prev, [msg.chat_id]: [...chatMsgs, msg]};
			});
			emitToListeners('message:new', msg);
			emitToListeners('new:sms', data);
		});

		// --- получение нового сообщения ---
		socket.on('message:new', (msg) => {
			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				return {...prev, [msg.chat_id]: [...chatMsgs, msg]};
			});
			emitToListeners('message:new', msg);
		});

		socket.on('message:update', (msg) => {
			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				return {
					...prev,
					[msg.chat_id]: chatMsgs.map((m) => (m.id === msg.id ? msg : m)),
				};
			});
			emitToListeners('message:update', msg);
		});

		// --- чаты ---
		socket.on('chat:list:init', (payload) => {
			setChats(payload);
			emitToListeners('chat:list:init', payload);
		});

		socket.on('chat:list:update', (chat) => {
			setChats((prev) => {
				const idx = prev.findIndex((c) => c.chat_id === chat.chat_id);
				if (idx >= 0) {
					const newArr = [...prev];
					newArr[idx] = chat;
					return newArr;
				}
				return [chat, ...prev];
			});
			emitToListeners('chat:list:update', chat);
		});

		socket.on('sms:update_message', (data) => {
			const msg = data.message;

			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				return {
					...prev,
					[msg.chat_id]: chatMsgs.map((m) => (m.id === msg.id ? msg : m)),
				};
			});
			emitToListeners('message:update', msg);
			emitToListeners('sms:update_message', data);
		});

		socket.on('sms:edit_message', (data) => {
			const msg = data.message;

			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				return {
					...prev,
					[msg.chat_id]: chatMsgs.map((m) => (m.id === msg.id ? msg : m)),
				};
			});
			emitToListeners('message:update', msg);
			emitToListeners('sms:edit_message', data);
		});

		socket.on('sms:reply_message', (data) => {
			const msg = data.message;

			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				return {...prev, [msg.chat_id]: [...chatMsgs, msg]};
			});
			emitToListeners('message:new', msg);
			emitToListeners('sms:reply_message', data);
		});

		socket.on('sms:delete_message', (data) => {

			setMessages((prev) => {
				const chatMsgs = prev[data.chat_id] || [];
				return {
					...prev,
					[data.chat_id]: chatMsgs.filter((m) => m.id !== data.messageId),
				};
			});
			emitToListeners('sms:delete_message', data);
		});

		socket.on('sms:status_update', (data) => {

			setMessages((prev) => {
				const chatMsgs = prev[data.chat_id] || [];
				return {
					...prev,
					[data.chat_id]: chatMsgs.map((m) =>
						m.id === data.messageId ? {...m, status: data.status} : m
					),
				};
			});
			emitToListeners('sms:status_update', data);
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
		connect();
		return () => {
			socketRef.current?.disconnect();
		};
	}, [connect]);

	const joinRoom = useCallback((chatId) => {
			if (!chatId) {
				console.warn('⚠️ [FRONTEND] joinRoom: chatId is empty');
				return;
			}

			if (!PRODMODE) {
				return;
			}

			if (socketRef.current && connected) {
				socketRef.current.emit('room:join', chatId);
			} else {
				console.warn('⚠️ [FRONTEND] joinRoom: socket not connected or not available');
			}
		},
		[connected]
	);

	/*const sendMessage = useCallback(
		(chatId, text) => {

			if (!chatId || !text) {
				console.warn('⚠️ [FRONTEND] sendMessage: chatId or text is empty');
				return;
			}

			if (!PRODMODE) {
				console.log(`[Mock] sendMessage: adding mock message to chat ${chatId}`);
				// mock-режим — добавляем локально
				const newMsg = {
					id: Date.now(),
					chat_id: chatId,
					from_id: 'self',
					text,
					created_at: Date.now() / 100,
					isSending: false,
				};
				setMessages((prev) => {
					const chatMsgs = prev[chatId] || [];
					return {...prev, [chatId]: [...chatMsgs, newMsg]};
				});
				emitToListeners('message:new', newMsg);
				return;
			}

			if (!socketRef.current) {
				console.error('❌ [FRONTEND] sendMessage: socket not available');
				return;
			}

			const msg = { chat_id: chatId, text };
			socketRef.current.emit('sms:new_message', msg);

			// добавляем локально сразу
			setMessages((prev) => {
				const chatMsgs = prev[chatId] || [];
				const tempMsg = { ...msg, id: Date.now(), from_id: 'self', isSending: true };
				return {...prev, [chatId]: [...chatMsgs, tempMsg]};
			});
		},
		[emitToListeners]
	);*/

	return (
		<ChatSocketContext.Provider
			value={{
				connected,
				connectionStatus,
				chats,
				messages,
				joinRoom,
				/*sendMessage,*/
				on,
				off,

				// --- новые методы ---
				updateMessage: (chatId, updatedMsg) => {
					setMessages((prev) => {
						const chatMsgs = prev[chatId] || [];
						return {
							...prev,
							[chatId]: chatMsgs.map((m) => (m.id === updatedMsg.id ? {...m, ...updatedMsg} : m)),
						};
					});
					emitToListeners('message:update', updatedMsg);
				},

				replyToMessage: (chatId, parentId, text) => {
					const replyMsg = {
						id: Date.now(),
						chat_id: chatId,
						from_id: 'self',
						text,
						replyTo: parentId,
						created_at: Date.now() / 1000,
						isSending: false,
					};
					setMessages((prev) => {
						const chatMsgs = prev[chatId] || [];
						return {...prev, [chatId]: [...chatMsgs, replyMsg]};
					});
					emitToListeners('message:new', replyMsg);
				},

				editMessage: (chatId, msgId, newText) => {
					setMessages((prev) => {
						const chatMsgs = prev[chatId] || [];
						return {
							...prev,
							[chatId]: chatMsgs.map((m) =>
								m.id === msgId ? {...m, text: newText, updated_at: Date.now() / 100} : m
							),
						};
					});
					emitToListeners('message:update', { chat_id: chatId, id: msgId, text: newText });
				},

				// --- дополнительные методы для API-событий ---
				deleteMessage: (chatId, messageId) => {
					if (!PRODMODE) {
						setMessages((prev) => {
							const chatMsgs = prev[chatId] || [];
							return {
								...prev,
								[chatId]: chatMsgs.filter((m) => m.id !== messageId),
							};
						});
						return;
					}

					if (socketRef.current) {
						socketRef.current.emit('sms:delete_message', { chat_id: chatId, messageId });
					}
				},

				updateMessageStatus: (chatId, messageId, status) => {
					if (!PRODMODE) {
						setMessages((prev) => {
							const chatMsgs = prev[chatId] || [];
							return {
								...prev,
								[chatId]: chatMsgs.map((m) => (m.id === messageId ? {...m, status} : m)),
							};
						});
						return;
					}

					if (socketRef.current) {
						socketRef.current.emit('sms:status_update', { chat_id: chatId, messageId, status });
					}
				},
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
