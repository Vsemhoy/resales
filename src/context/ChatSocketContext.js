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
		console.log('🔌 ChatSocketProvider: connect() called, PRODMODE:', PRODMODE);

		if (!PRODMODE) {
			console.log('[Mock] WS disabled, using mock data');
			setConnected(true);
			setConnectionStatus('mock');

			// --- загружаем mock-чаты ---
			const mockChats = MOCK?.content?.sms || [];
			console.log(`[Mock] Loaded ${mockChats.length} chats:`, mockChats);
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
				console.log(`[Mock] Chat ${chatId}: loaded ${chatMessages.length} messages`, chatMessages);
			});

			console.log('[Mock] Final messages structure:', chatMessagesMap);
			setMessages(chatMessagesMap);

			return;
		}

		if (socketRef.current?.connected) {
			console.log('🔌 Socket already connected, skipping');
			return;
		}

		console.log('🔌 Connecting to WebSocket:', url);
		const socket = io(url, { transports: ['websocket', 'polling'], withCredentials: true });
		socketRef.current = socket;

		socket.on('connect', () => {
			console.log('✅ WebSocket connected');
			setConnected(true);
			setConnectionStatus('connected');
			socket.emit('chat:list:get');
		});
		socket.on('disconnect', (reason) => {
			console.log('❌ WebSocket disconnected, reason:', reason);
			setConnected(false);
			setConnectionStatus('disconnected');
		});

		socket.on('connect_error', (error) => {
			console.error('❌ WebSocket connection error:', error);
		});

		// --- запрос списка чатов ---
		socket.on('chat:list:get', (payload) => {
			console.log('📨 [FRONTEND] Received chat:list:get response:', payload);
			console.log(`📊 [FRONTEND] Chat list contains ${payload?.length || 0} chats`);
			setChats(payload);
			emitToListeners('chat:list:get', payload);
		});

		// --- чаты ---
		socket.on('chat:list:init', (payload) => {
			console.log('📨 [FRONTEND] Received chat:list:init:', payload);
			setChats(payload);
			emitToListeners('chat:list:init', payload);
		});

		socket.on('chat:list:update', (chat) => {
			console.log('📨 [FRONTEND] Received chat:list:update:', chat);
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
			console.log('📨 [FRONTEND] Received message:new:', msg);
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
			console.log('📨 [FRONTEND] Received message:update:', msg);
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
			console.log('📨 [FRONTEND] Received sms:new_message from Laravel:');
			console.log('📦 [FRONTEND] Full data structure:', JSON.stringify(data, null, 2));

			const msg = data.message;
			console.log('🔍 [FRONTEND] Extracted message:', msg);
			console.log(`🎯 [FRONTEND] Target chat ID: ${msg?.chat_id}`);
			console.log(`📝 [FRONTEND] Message text: "${msg?.text}"`);
			console.log(
				`👤 [FRONTEND] From: ${msg?.from?.name} ${msg?.from?.surname} (ID: ${msg?.from?.id})`
			);
			console.log(`👥 [FRONTEND] To: ${msg?.to?.name} ${msg?.to?.surname} (ID: ${msg?.to?.id})`);

			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				const newMessages = { ...prev, [msg.chat_id]: [...chatMsgs, msg] };
				console.log(`💬 [FRONTEND] Added new message to chat ${msg.chat_id}:`, msg);
				console.log(
					`📊 [FRONTEND] Now ${newMessages[msg.chat_id]?.length} messages in chat ${msg.chat_id}`
				);
				return newMessages;
			});
			emitToListeners('message:new', msg);
			emitToListeners('sms:new_message', data);
		});

		socket.on('sms:update_message', (data) => {
			console.log('📨 [FRONTEND] Received sms:update_message:', data);
			console.log('📦 [FRONTEND] Full update data:', JSON.stringify(data, null, 2));

			const msg = data.message;
			console.log(`🔍 [FRONTEND] Updating message ID: ${msg?.id} in chat: ${msg?.chat_id}`);

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
			emitToListeners('sms:update_message', data);
		});

		socket.on('sms:edit_message', (data) => {
			console.log('📨 [FRONTEND] Received sms:edit_message:', data);
			console.log('📦 [FRONTEND] Full edit data:', JSON.stringify(data, null, 2));

			const msg = data.message;
			console.log(`🔍 [FRONTEND] Editing message ID: ${msg?.id} in chat: ${msg?.chat_id}`);

			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				const newMessages = {
					...prev,
					[msg.chat_id]: chatMsgs.map((m) => (m.id === msg.id ? msg : m)),
				};
				console.log(`💬 [FRONTEND] Edited message in chat ${msg.chat_id}`);
				return newMessages;
			});
			emitToListeners('message:update', msg);
			emitToListeners('sms:edit_message', data);
		});

		socket.on('sms:reply_message', (data) => {
			console.log('📨 [FRONTEND] Received sms:reply_message:', data);
			console.log('📦 [FRONTEND] Full reply data:', JSON.stringify(data, null, 2));

			const msg = data.message;
			console.log(`🔍 [FRONTEND] Reply to message ID: ${msg?.replyTo} in chat: ${msg?.chat_id}`);

			setMessages((prev) => {
				const chatMsgs = prev[msg.chat_id] || [];
				const newMessages = { ...prev, [msg.chat_id]: [...chatMsgs, msg] };
				console.log(`💬 [FRONTEND] Added reply message to chat ${msg.chat_id}:`, msg);
				return newMessages;
			});
			emitToListeners('message:new', msg);
			emitToListeners('sms:reply_message', data);
		});

		socket.on('sms:delete_message', (data) => {
			console.log('📨 [FRONTEND] Received sms:delete_message:', data);
			console.log('📦 [FRONTEND] Full delete data:', JSON.stringify(data, null, 2));
			console.log(
				`🗑️ [FRONTEND] Deleting message ID: ${data.messageId} from chat: ${data.chat_id}`
			);

			setMessages((prev) => {
				const chatMsgs = prev[data.chat_id] || [];
				const newMessages = {
					...prev,
					[data.chat_id]: chatMsgs.filter((m) => m.id !== data.messageId),
				};
				console.log(`💬 [FRONTEND] Deleted message ${data.messageId} from chat ${data.chat_id}`);
				console.log(
					`📊 [FRONTEND] Now ${newMessages[data.chat_id]?.length} messages in chat ${data.chat_id}`
				);
				return newMessages;
			});
			emitToListeners('sms:delete_message', data);
		});

		socket.on('sms:status_update', (data) => {
			console.log('📨 [FRONTEND] Received sms:status_update:', data);
			console.log('📦 [FRONTEND] Full status update data:', JSON.stringify(data, null, 2));
			console.log(
				`🔄 [FRONTEND] Updating status for message ID: ${data.messageId} in chat: ${data.chat_id} to: ${data.status}`
			);

			setMessages((prev) => {
				const chatMsgs = prev[data.chat_id] || [];
				const newMessages = {
					...prev,
					[data.chat_id]: chatMsgs.map((m) =>
						m.id === data.messageId ? { ...m, status: data.status } : m
					),
				};
				console.log(
					`💬 [FRONTEND] Updated status for message ${data.messageId} in chat ${data.chat_id}`
				);
				return newMessages;
			});
			emitToListeners('sms:status_update', data);
		});

		// Логируем все входящие события для отладки
		socket.onAny((eventName, ...args) => {
			console.log(`📨 [FRONTEND - All Events] Received event: ${eventName}`, args);

			// Особенно подробно логируем события от Laravel
			if (eventName.startsWith('sms:')) {
				console.log(
					`🚀 [FRONTEND - Laravel Event] ${eventName}:`,
					JSON.stringify(args[0], null, 2)
				);
			}
		});

		// Логируем исходящие события
		const originalEmit = socket.emit.bind(socket);
		socket.emit = (event, ...args) => {
			console.log(`📤 [FRONTEND - Outgoing] Emitting event: ${event}`, args);
			return originalEmit(event, ...args);
		};
	}, [url, emitToListeners]);

	useEffect(() => {
		console.log('🔌 ChatSocketProvider: useEffect - starting connection');
		connect();

		return () => {
			console.log('🔌 ChatSocketProvider: cleanup - disconnecting socket');
			socketRef.current?.disconnect();
		};
	}, [connect]);

	const joinRoom = useCallback(
		(chatId) => {
			console.log(
				`🔌 [FRONTEND] joinRoom called for chat: ${chatId}, connected: ${connected}, PRODMODE: ${PRODMODE}`
			);

			if (!chatId) {
				console.warn('⚠️ [FRONTEND] joinRoom: chatId is empty');
				return;
			}

			if (!PRODMODE) {
				console.log(`[Mock] joinRoom: mock mode, skipping room join for chat ${chatId}`);
				return;
			}

			if (socketRef.current && connected) {
				console.log(`🔌 [FRONTEND] Emitting room:join for chat: ${chatId}`);
				socketRef.current.emit('room:join', chatId);
			} else {
				console.warn('⚠️ [FRONTEND] joinRoom: socket not connected or not available');
			}
		},
		[connected]
	);

	const sendMessage = useCallback(
		(chatId, text) => {
			console.log(`🔌 [FRONTEND] sendMessage called for chat ${chatId}:`, text);

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
					created_at: Date.now() / 1000,
					isSending: false,
				};
				setMessages((prev) => {
					const chatMsgs = prev[chatId] || [];
					const newMessages = { ...prev, [chatId]: [...chatMsgs, newMsg] };
					console.log(`[Mock] Updated messages for chat ${chatId}:`, newMessages[chatId]);
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
			console.log(`🔌 [FRONTEND] Emitting sms:new_message:`, msg);
			socketRef.current.emit('sms:new_message', msg);

			// добавляем локально сразу
			setMessages((prev) => {
				const chatMsgs = prev[chatId] || [];
				const tempMsg = { ...msg, id: Date.now(), from_id: 'self', isSending: true };
				const newMessages = { ...prev, [chatId]: [...chatMsgs, tempMsg] };
				console.log(`💬 [FRONTEND] Added temporary message to chat ${chatId}:`, tempMsg);
				return newMessages;
			});
		},
		[emitToListeners]
	);

	// Логируем изменения состояния
	useEffect(() => {
		console.log('💬 [FRONTEND] Messages state updated - keys:', Object.keys(messages));
		Object.keys(messages).forEach((chatId) => {
			console.log(`   Chat ${chatId}: ${messages[chatId]?.length} messages`);
		});
	}, [messages]);

	useEffect(() => {
		console.log('📱 [FRONTEND] Chats state updated - count:', chats?.length);
	}, [chats]);

	useEffect(() => {
		console.log('🔌 [FRONTEND] Connection status changed:', { connected, connectionStatus });
	}, [connected, connectionStatus]);

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
					console.log(`🔌 [FRONTEND] updateMessage called for chat ${chatId}:`, updatedMsg);
					setMessages((prev) => {
						const chatMsgs = prev[chatId] || [];
						const newMessages = {
							...prev,
							[chatId]: chatMsgs.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m)),
						};
						console.log(`💬 [FRONTEND] Updated message in chat ${chatId}`);
						return newMessages;
					});
					emitToListeners('message:update', updatedMsg);
				},

				replyToMessage: (chatId, parentId, text) => {
					console.log(
						`🔌 [FRONTEND] replyToMessage called for chat ${chatId}, parent: ${parentId}:`,
						text
					);
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
						console.log(`💬 [FRONTEND] Added reply message to chat ${chatId}:`, replyMsg);
						return newMessages;
					});
					emitToListeners('message:new', replyMsg);
				},

				editMessage: (chatId, msgId, newText) => {
					console.log(
						`🔌 [FRONTEND] editMessage called for chat ${chatId}, message ${msgId}:`,
						newText
					);
					setMessages((prev) => {
						const chatMsgs = prev[chatId] || [];
						const newMessages = {
							...prev,
							[chatId]: chatMsgs.map((m) =>
								m.id === msgId ? { ...m, text: newText, updated_at: Date.now() / 1000 } : m
							),
						};
						console.log(`💬 [FRONTEND] Edited message in chat ${chatId}`);
						return newMessages;
					});
					emitToListeners('message:update', { chat_id: chatId, id: msgId, text: newText });
				},

				// --- дополнительные методы для API-событий ---
				deleteMessage: (chatId, messageId) => {
					console.log(
						`🔌 [FRONTEND] deleteMessage called for chat ${chatId}, message: ${messageId}`
					);
					if (!PRODMODE) {
						setMessages((prev) => {
							const chatMsgs = prev[chatId] || [];
							const newMessages = {
								...prev,
								[chatId]: chatMsgs.filter((m) => m.id !== messageId),
							};
							console.log(`[Mock] Deleted message from chat ${chatId}`);
							return newMessages;
						});
						return;
					}

					if (socketRef.current) {
						console.log(
							`🔌 [FRONTEND] Emitting sms:delete_message for chat ${chatId}, message: ${messageId}`
						);
						socketRef.current.emit('sms:delete_message', { chat_id: chatId, messageId });
					}
				},

				updateMessageStatus: (chatId, messageId, status) => {
					console.log(
						`🔌 [FRONTEND] updateMessageStatus called for chat ${chatId}, message ${messageId}:`,
						status
					);
					if (!PRODMODE) {
						setMessages((prev) => {
							const chatMsgs = prev[chatId] || [];
							const newMessages = {
								...prev,
								[chatId]: chatMsgs.map((m) => (m.id === messageId ? { ...m, status } : m)),
							};
							console.log(`[Mock] Updated message status in chat ${chatId}`);
							return newMessages;
						});
						return;
					}

					if (socketRef.current) {
						console.log(
							`🔌 [FRONTEND] Emitting sms:status_update for chat ${chatId}, message: ${messageId}`
						);
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

	// Логируем использование хука
	console.log('🔌 [FRONTEND] useChatSocket called, context:', {
		connected: context.connected,
		chatsCount: context.chats?.length,
		messagesKeys: Object.keys(context.messages),
		connectionStatus: context.connectionStatus,
	});

	return context;
};
