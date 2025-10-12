// context/ChatSocketContext.js
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { PRODMODE } from '../config/config.js';
import { MOCK, CHAT_MOCK } from '../modules/1CHAT/mock/mock.js';

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
			console.log('[Mock] WS disabled, using mock data');
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
					.map((msg) => ({ ...msg, chat_id: chatId }));
			});
			setMessages(chatMessagesMap);

			return;
		}

		if (socketRef.current?.connected) return;

		const socket = io(url, { transports: ['websocket', 'polling'], withCredentials: true });
		socketRef.current = socket;

		socket.on('connect', () => {
			setConnected(true);
			setConnectionStatus('connected');
		});

		socket.on('disconnect', () => {
			setConnected(false);
			setConnectionStatus('disconnected');
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
				return { ...prev, [msg.chat_id]: [...chatMsgs, msg] };
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
	}, [url, emitToListeners]);

	useEffect(() => {
		connect();
		return () => {
			socketRef.current?.disconnect();
		};
	}, [connect]);

	const joinRoom = useCallback(
		(chatId) => {
			if (!chatId) return;

			if (!PRODMODE) return; // mock-режим — ничего не делаем

			if (socketRef.current && connected) {
				socketRef.current.emit('joinRoom', chatId);
			}
		},
		[connected]
	);

	const sendMessage = useCallback(
		(chatId, text) => {
			if (!chatId || !text) return;

			if (!PRODMODE) {
				// mock-режим — добавляем локально
				const newMsg = {
					id: Date.now(),
					chat_id: chatId,
					from_id: 'self',
					text,
					created_at: Date.now() / 1000,
					isSending: false,
				};
				setMessages((prev) => {
					const chatMsgs = prev[chatId] || [];
					return { ...prev, [chatId]: [...chatMsgs, newMsg] };
				});
				emitToListeners('message:new', newMsg);
				return;
			}

			if (!socketRef.current) return;

			const msg = { chat_id: chatId, text };
			socketRef.current.emit('message:send', msg);

			// добавляем локально сразу
			setMessages((prev) => {
				const chatMsgs = prev[chatId] || [];
				return {
					...prev,
					[chatId]: [...chatMsgs, { ...msg, id: Date.now(), from_id: 'self', isSending: true }],
				};
			});
		},
		[emitToListeners]
	);

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
							[chatId]: chatMsgs.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m)),
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
						return { ...prev, [chatId]: [...chatMsgs, replyMsg] };
					});
					emitToListeners('message:new', replyMsg);
				},

				editMessage: (chatId, msgId, newText) => {
					setMessages((prev) => {
						const chatMsgs = prev[chatId] || [];
						return {
							...prev,
							[chatId]: chatMsgs.map((m) =>
								m.id === msgId ? { ...m, text: newText, updated_at: Date.now() / 1000 } : m
							),
						};
					});
					emitToListeners('message:update', { chat_id: chatId, id: msgId, text: newText });
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
