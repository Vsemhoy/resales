import {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {io} from 'socket.io-client';
import {PRODMODE} from '../config/config.js';
import {CHAT_MOCK, MOCK} from '../modules/CHAT/mock/mock.js';


export const ChatSocketContext = createContext(null);

export const ChatSocketProvider = ({ children, url }) => {
	const socketRef = useRef(null);
	const [connected, setConnected] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState('disconnected');

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
			/*console.log('[Mock] WS disabled, using mock data');*/
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
				const chatMessages = (CHAT_MOCK?.content?.messages || [])
					.filter((msg) => msg.from_id === sms.from.id || msg.to?.id === sms.from.id)
					.map((msg) => ({ ...msg, chat_id: chatId }));

				chatMessagesMap[chatId] = chatMessages;
			});
			setMessages(chatMessagesMap);
			return;
		}

		if (socketRef.current?.connected) {
			return;
		}

		const socket = io(url, { transports: ['websocket', 'polling'], withCredentials: true });
		socketRef.current = socket;

		socket.on('connect', () => {
			setConnected(true);
			setConnectionStatus('connected');
			socket.emit('chat:list:get');
		});
		socket.on('disconnect', (reason) => {
			setConnected(false);
			setConnectionStatus('disconnected');
		});

		socket.on('connect_error', (error) => {
			console.error('❌ WebSocket connection error:', error);
		});

		// --- запрос списка чатов ---
		socket.on('chat:list:get', (payload) => {
			setChats(payload);
			emitToListeners('chat:list:get', payload);
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

		// --- сообщения ---
		socket.on('message:new', (msg) => {
			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				const newMessages = { ...prev, [msg.chat_id]: [...chatMsgs, msg] };
				console.log(
					`💬 [FRONTEND] Updated messages for chat ${msg.chat_id}:`,
					newMessages[msg.chat_id]
				);
				return newMessages;
			});
			emitToListeners('message:new', msg);
		});

		socket.on('message:update', (msg) => {
			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				const newMessages = {
					...prev,
					[msg.chat_id]: chatMsgs.map((m) => (m.id === msg.id ? msg : m)),
				};
				console.log(`💬 [FRONTEND] Updated message in chat ${msg.chat_id}`);
				return newMessages;
			});
			emitToListeners('message:update', msg);
		});

		// --- обработчики для API-событий (из Laravel) ---
		socket.on('sms:new_message', (data) => {
			const msg = data.message;

			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				return {...prev, [msg.chat_id]: [...chatMsgs, msg]};
			});
			emitToListeners('message:new', msg);
			emitToListeners('sms:new_message', data);
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
		socket.onAny((eventName, ...args) => {
			// Особенно подробно логируем события от Laravel
			if (eventName.startsWith('sms:')) {

			}
		});

		// Логируем исходящие события
		const originalEmit = socket.emit.bind(socket);
		socket.emit = (event, ...args) => {
			return originalEmit(event, ...args);
		};
	}, [url, emitToListeners]);

	useEffect(() => {
		connect();

		return () => {
			socketRef.current?.disconnect();
		};
	}, [connect]);

	const joinRoom = useCallback(
		(chatId) => {

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

	const sendMessage = useCallback(
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
					const newMessages = { ...prev, [chatId]: [...chatMsgs, newMsg] };
					return newMessages;
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
	);

	// Логируем изменения состояния
	useEffect(() => {

	}, [messages]);

	return (
		<ChatSocketContext.Provider
			value={{
				connected,
				connectionStatus,
				chats,
				messages,
				joinRoom,
				sendMessage,
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
						const newMessages = { ...prev, [chatId]: [...chatMsgs, replyMsg] };
						return newMessages;
					});
					emitToListeners('message:new', replyMsg);
				},

				editMessage: (chatId, msgId, newText) => {
					setMessages((prev) => {
						const chatMsgs = prev[chatId] || [];
						const newMessages = {
							...prev,
							[chatId]: chatMsgs.map((m) =>
								m.id === msgId ? { ...m, text: newText, updated_at: Date.now() / 100 } : m
							),
						};
						return newMessages;
					});
					emitToListeners('message:update', { chat_id: chatId, id: msgId, text: newText });
				},

				// --- дополнительные методы для API-событий ---
				deleteMessage: (chatId, messageId) => {
					if (!PRODMODE) {
						setMessages((prev) => {
							const chatMsgs = prev[chatId] || [];
							const newMessages = {
								...prev,
								[chatId]: chatMsgs.filter((m) => m.id !== messageId),
							};
							return newMessages;
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
							const newMessages = {
								...prev,
								[chatId]: chatMsgs.map((m) => (m.id === messageId ? { ...m, status } : m)),
							};
							return newMessages;
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
