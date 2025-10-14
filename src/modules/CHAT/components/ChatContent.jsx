import styles from './style/Chat.module.css';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useUserData } from '../../../context/UserDataContext';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { useChatSocket } from '../../../context/ChatSocketContext';
import { useChatRole } from '../../../hooks/sms/useChatRole.js';
import { Layout, message } from 'antd';
import { nanoid } from 'nanoid';
import { ChatInput } from './ChatInput';
import { ChatDivider } from './ChatDivider';
import ChatSelfMsg from './ChatSelfMsg';
import ChatIncomingMsg from './ChatIncomingMsg';
// import { CHAT_MOCK } from '../mock/mock';
import useSms from '../../../hooks/sms/useSms.js';

const { Content, Footer } = Layout;
const generateUUID = () => nanoid(8);

const MemoChatSelfMsg = React.memo(ChatSelfMsg);
const MemoChatIncomingMsg = React.memo(ChatIncomingMsg);
const MemoChatDivider = React.memo(ChatDivider);

export default function ChatContent({ chatId }) {
	const messagesContainerRef = useRef(null);
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	// Используем кастомный хук для логики ролей
	const { getRole, getDisplayName } = useChatRole(currentUserId);

	const { sendSms } = useSendSms();
	const { connectionStatus, socket } = useChatSocket();

	// const [messages, setMessages] = useState([]);
	// const [who, setWho] = useState(null);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [localMessages, setLocalMessages] = useState([]);
	const { messages, who } = useSms(chatId);
	const DEBUGGER = 'DEBUGGER CHAT CONTENT';
	console.log(DEBUGGER);

	// // Функция для определения отправителя сообщения
	// const getMessageSenderId = useCallback((msg) => {
	// 	// Для локальных сообщений
	// 	if (msg.isLocal) return msg.from_id;

	// 	// PRODMODE формат: данные от Laravel
	// 	if (msg.right?.from_id) return msg.right.from_id;
	// 	if (msg.from_id) return msg.from_id;
	// 	if (msg.from?.id) return msg.from.id;
	// 	return null;
	// }, []);

	// // Функция для получения timestamp из сообщения
	// const getMessageTimestamp = useCallback((msg) => {
	// 	// Для локальных сообщений
	// 	if (msg.isLocal) return msg.timestamp;

	// 	// PRODMODE формат: данные от Laravel (msg.right и msg.left)
	// 	if (msg.right?.updated_at) return msg.right.updated_at * 1000;
	// 	if (msg.right?.created_at) return msg.right.created_at * 1000;
	// 	if (msg.left?.updated_at) return msg.left.updated_at * 1000;
	// 	if (msg.left?.created_at) return msg.left.created_at * 1000;

	// 	// MOCK формат
	// 	if (msg.updated_at) return msg.updated_at * 1000;
	// 	if (msg.created_at) return msg.created_at * 1000;

	// 	// Для сообщений без timestamp используем текущее время
	// 	// Это нормально для новых сообщений, которые только что пришли
	// 	return Date.now();
	// }, []);

	// // Функция для получения текста сообщения
	// const getMessageText = useCallback((msg) => {
	// 	// Для локальных сообщений
	// 	if (msg.isLocal) return msg.text;

	// 	// PRODMODE формат
	// 	if (msg.right?.text) return msg.right.text;
	// 	if (msg.left?.text) return msg.left.text;

	// 	// MOCK формат
	// 	return msg.text;
	// }, []);

	// Функция для получения ID сообщения (универсальная)
	// const getMessageId = useCallback((msg) => {
	// 	// Для локальных сообщений
	// 	if (msg.isLocal) return msg.id;

	// 	// PRODMODE формат
	// 	if (msg.right?.id) return msg.right.id;
	// 	if (msg.left?.id) return msg.left.id;

	// 	// MOCK формат
	// 	return msg.id;
	// }, []);

	// // Функция для нормализации сообщения
	// const normalizeMessage = useCallback(
	// 	(msg) => {
	// 		const senderId = getMessageSenderId(msg);
	// 		const isSelf = senderId === currentUserId || msg.isLocal;

	// 		// Используем хук для определения роли и имени
	// 		const role = isSelf ? 'self' : getRole(msg);
	// 		const displayName = isSelf ? 'Вы' : getDisplayName(msg, role, false);

	// 		const timestamp = getMessageTimestamp(msg);
	// 		const text = getMessageText(msg);
	// 		const id = getMessageId(msg);

	// 		// console.log('🕒 [CHAT] Normalizing message:', {
	// 		// 	original: msg,
	// 		// 	senderId,
	// 		// 	isSelf,
	// 		// 	timestamp,
	// 		// 	text,
	// 		// 	id,
	// 		// 	role,
	// 		// 	displayName,
	// 		// 	isLocal: msg.isLocal,
	// 		// });

	// 		const normalizedMsg = {
	// 			id: id,
	// 			text: text,
	// 			timestamp: timestamp,
	// 			role: role,
	// 			senderName: displayName || 'Собеседник',
	// 			isLocal: msg.isLocal || false,
	// 			isSending: msg.isSending || false,
	// 			// Сохраняем оригинальные данные для отладки
	// 			_raw: msg,
	// 		};

	// 		// console.log('✅ [CHAT] Normalized message:', normalizedMsg);
	// 		return normalizedMsg;
	// 	},
	// 	[
	// 		currentUserId,
	// 		getMessageSenderId,
	// 		getRole,
	// 		getDisplayName,
	// 		getMessageTimestamp,
	// 		getMessageText,
	// 		getMessageId,
	// 	]
	// );

	// useEffect(() => {
	// 	setLoading(true);
	// 	setError(null);
	// 	// setMessages([]);
	// 	setLocalMessages([]);

	// 	// MOCK режим
	// 	// if (connectionStatus === 'mock') {
	// 	// 	const sms = CHAT_MOCK?.content?.messages || [];
	// 	// 	// setMessages(sms);
	// 	// 	// setWho('Собеседник');
	// 	// 	setLoading(false);
	// 	// 	return;
	// 	// }

	// 	// SOCKET режим
	// 	if (connectionStatus === 'connected' && socket) {
	// 		console.log('🔌 [CHAT] Connecting to chat room:', chatId);

	// 		const handleMessageNew = (msg) => {
	// 			console.log('📨 [CHAT] New message received:', {
	// 				message: msg,
	// 				senderId: getMessageSenderId(msg),
	// 				currentUserId,
	// 				isSelf: getMessageSenderId(msg) === currentUserId,
	// 				timestamp: getMessageTimestamp(msg),
	// 			});

	// 			if (
	// 				(!getMessageText(msg) || getMessageText(msg).trim() === '') &&
	// 				(!msg.files || msg.files.length === 0)
	// 			)
	// 				return;

	// 			// Проверяем chat_id в разных форматах
	// 			const messageChatId = msg.chat_id || msg.left?.chat_id || msg.right?.chat_id;
	// 			if (messageChatId !== chatId) return;

	// 			// setMessages((prev) => {
	// 			// 	// Проверяем, есть ли локальное сообщение с таким же текстом
	// 			// 	const localIndex = prev.findIndex(
	// 			// 		(lMsg) =>
	// 			// 			lMsg.isLocal &&
	// 			// 			getMessageText(lMsg) === getMessageText(msg) &&
	// 			// 			getMessageSenderId(lMsg) === getMessageSenderId(msg)
	// 			// 	);

	// 			// 	if (localIndex >= 0) {
	// 			// 		const newPrev = [...prev];
	// 			// 		newPrev[localIndex] = {
	// 			// 			...newPrev[localIndex],
	// 			// 			id: getMessageId(msg),
	// 			// 			isLocal: false,
	// 			// 			isSending: false,
	// 			// 			// Сохраняем timestamp из оригинального сообщения
	// 			// 			timestamp: getMessageTimestamp(msg),
	// 			// 		};
	// 			// 		return newPrev;
	// 			// 	}

	// 			// 	return [...prev, msg];
	// 			// });
	// 		};

	// 		const handleMessageUpdate = (updatedMsg) => {
	// 			// setMessages((prev) =>
	// 			// 	prev.map((m) =>
	// 			// 		getMessageId(m) === getMessageId(updatedMsg) ? { ...m, ...updatedMsg } : m
	// 			// 	)
	// 			// );
	// 		};

	// 		const handleChatHistory = (historyData) => {
	// 			console.log('📚 [CHAT] History received:', historyData);

	// 			if (historyData && Array.isArray(historyData.messages)) {
	// 				// Обрабатываем историю сообщений
	// 				// const historyMessages = historyData.messages.map((msg) => {
	// 				// 	// Преобразуем формат истории в ожидаемый формат
	// 				// 	return {
	// 				// 		right: msg, // Помещаем в right для совместимости с normalizeMessage
	// 				// 		chat_id: chatId,
	// 				// 	};
	// 				// });

	// 				// setMessages(historyMessages);
	// 				// setWho(historyData.who || 'Собеседник');
	// 				setLoading(false);
	// 			} else if (historyData && Array.isArray(historyData)) {
	// 				// Если история пришла как массив сообщений
	// 				// const historyMessages = historyData.map((msg) => ({
	// 				// 	right: msg,
	// 				// 	chat_id: chatId,
	// 				// }));

	// 				// setMessages(historyMessages);
	// 				// setWho('Собеседник');
	// 				setLoading(false);
	// 			} else {
	// 				console.warn('❌ [CHAT] Invalid history format:', historyData);
	// 				setLoading(false);
	// 			}
	// 		};

	// 		// Подписываемся на правильные события WebSocket
	// 		socket.emit('room:join', chatId);

	// 		// Запрашиваем историю сообщений
	// 		socket.emit('sms:get_history', { chat_id: chatId });

	// 		// Слушаем события
	// 		socket.on('sms:new_message', handleMessageNew);
	// 		socket.on('sms:update_message', handleMessageUpdate);
	// 		socket.on('sms:history', handleChatHistory);
	// 		socket.on('room:history', handleChatHistory); // альтернативное событие

	// 		// Таймаут для отображения, если история не пришла
	// 		const timeoutId = setTimeout(() => {
	// 			if (loading) {
	// 				console.log('⏰ [CHAT] History timeout, setting loading to false');
	// 				setLoading(false);
	// 			}
	// 		}, 3000);

	// 		return () => {
	// 			clearTimeout(timeoutId);
	// 			socket.emit('room:leave', chatId);
	// 			socket.off('sms:new_message', handleMessageNew);
	// 			socket.off('sms:update_message', handleMessageUpdate);
	// 			socket.off('sms:history', handleChatHistory);
	// 			socket.off('room:history', handleChatHistory);
	// 		};
	// 	}

	// 	// fallback
	// 	if (connectionStatus === 'disconnected') {
	// 		// const sms = CHAT_MOCK?.content?.messages || [];
	// 		// setMessages(sms);
	// 		// setWho('Собеседник');
	// 		setLoading(false);
	// 	}
	// }, [
	// 	chatId,
	// 	socket,
	// 	connectionStatus,
	// 	currentUserId,
	// 	getMessageSenderId,
	// 	getMessageText,
	// 	getMessageTimestamp,
	// 	getMessageId,
	// 	loading,
	// ]);

	// --- Объединяем серверные и локальные сообщения ---
	const allMessages = useMemo(() => {
		const existingIds = new Set();
		const combined = [...messages, ...localMessages];

		// Фильтруем дубликаты
		// 	const uniqueMessages = combined.filter((msg) => {
		// 		const id = getMessageId(msg);
		// 		if (existingIds.has(id?.toString())) {
		// 			return false;
		// 		}
		// 		existingIds.add(id?.toString());
		// 		return true;
		// 	});

		// 	const normalized = uniqueMessages
		// 		.map(normalizeMessage)
		// 		.filter((msg) => msg.text && msg.text.trim() !== '')
		// 		.sort((a, b) => a.timestamp - b.timestamp);

		// 	// console.log('📊 [CHAT] All normalized messages:', normalized);
		return combined;
		// }, [messages, localMessages, normalizeMessage, getMessageId]);
	}, [messages, localMessages]);

	// --- Разделители по датам ---
	const formatChatDate = useCallback((ts) => {
		const d = new Date(ts);
		if (isNaN(d.getTime())) {
			console.error('❌ [CHAT] Invalid timestamp:', ts);
			return 'Неизвестная дата';
		}

		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);

		const isSameDay = (a, b) =>
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate();

		if (isSameDay(d, today)) return 'Сегодня';
		if (isSameDay(d, yesterday)) return 'Вчера';
		return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
	}, []);

	const messagesWithDividers = useMemo(() => {
		const items = [];
		let lastDayKey = null;

		for (const msg of allMessages) {
			const dayKey = new Date(msg.timestamp).toDateString();
			if (lastDayKey !== dayKey) {
				items.push({ type: 'divider', id: `divider-${dayKey}`, timestamp: msg.timestamp });
				lastDayKey = dayKey;
			}
			items.push({ type: 'msg', id: msg.id, message: msg });
		}
		return items;
	}, [allMessages]);

	// --- Скролл вниз при новых сообщениях ---
	const messagesContainerRefScroll = useCallback(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, []);

	useEffect(() => {
		messagesContainerRefScroll();
	}, [allMessages, chatId, messagesContainerRefScroll]);

	// --- Отправка сообщения ---
	const handleSend = useCallback(
		async (text) => {
			if (!text.trim()) return;

			const id = generateUUID();
			const newLocalMsg = {
				id,
				chat_id: chatId,
				text: text.trim(),
				timestamp: Date.now(),
				from_id: currentUserId, // Явно указываем отправителя
				isLocal: true,
				isSending: true,
			};

			setLocalMessages((prev) => [...prev, newLocalMsg]);
			// setMessages((prev) => [...prev, newLocalMsg]);

			try {
				// const res = await sendSms({ to: chatId, text: text.trim(), answer: null });
				// if (res?.data?.id) {
				// 	setMessages((prev) =>
				// 		prev.map((m) =>
				// 			getMessageId(m) === newLocalMsg.id
				// 				? {
				// 						...m,
				// 						id: res.data.id,
				// 						isLocal: false,
				// 						isSending: false,
				// 						// Добавляем timestamp из ответа сервера, если есть
				// 						updated_at: res.data.updated_at,
				// 						created_at: res.data.created_at,
				// 				  }
				// 				: m
				// 		)
				// 	);
				// 	setLocalMessages((prev) => prev.filter((m) => getMessageId(m) !== newLocalMsg.id));
				// } else {
				// 	setMessages((prev) =>
				// 		prev.map((m) => (getMessageId(m) === newLocalMsg.id ? { ...m, isSending: false } : m))
				// 	);
				// }
			} catch (err) {
				// setLocalMessages((prev) => prev.filter((msg) => getMessageId(msg) !== newLocalMsg.id));
				// setMessages((prev) => prev.filter((msg) => getMessageId(msg) !== newLocalMsg.id));
				message.error(err.message || 'Ошибка при отправке сообщения');
			}
		},
		[chatId, currentUserId]
	);

	const renderMessage = useCallback(
		(message) =>
			message.role === 'self' ? (
				<MemoChatSelfMsg key={message.id} message={message} />
			) : (
				<MemoChatIncomingMsg key={message.id} message={message} />
			),
		[]
	);

	if (error) return <div className={styles.error}>Ошибка загрузки: {error}</div>;

	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.chatContent}>
				<div className={styles.chatHeader}>
					<span>{who || 'Собеседник'}</span> <span>{DEBUGGER}</span>
				</div>
				<div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
					{loading && allMessages.length === 0 ? (
						<p className={styles.loading}>Загрузка сообщений...</p>
					) : allMessages.length === 0 ? (
						<p className={styles.empty}>Нет сообщений</p>
					) : (
						<div
							ref={messagesContainerRef}
							className={styles.messagesList}
							style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
						>
							{messagesWithDividers.map((item) =>
								item.type === 'divider' ? (
									<MemoChatDivider key={item.id}>{formatChatDate(item.timestamp)}</MemoChatDivider>
								) : (
									renderMessage(item.message)
								)
							)}
						</div>
					)}
				</div>
			</Content>

			<Footer className={styles['chat-input__footer']}>
				<ChatInput onSend={handleSend} />
			</Footer>
		</Layout>
	);
}
