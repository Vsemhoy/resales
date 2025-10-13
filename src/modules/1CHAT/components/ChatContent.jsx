import styles from './style/Chat.module.css';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useUserData } from '../../../context/UserDataContext';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { useChatSocket } from '../../../context/ChatSocketContext';
import { Layout, message } from 'antd';
import { nanoid } from 'nanoid';
import { ChatInput } from './ChatInput';
import { ChatDivider } from './ChatDivider';
import ChatSelfMsg from './ChatSelfMsg';
import ChatIncomingMsg from './ChatIncomingMsg';
import { CHAT_MOCK } from '../mock/mock';

const { Content, Footer } = Layout;
const generateUUID = () => nanoid(8);

const MemoChatSelfMsg = React.memo(ChatSelfMsg);
const MemoChatIncomingMsg = React.memo(ChatIncomingMsg);
const MemoChatDivider = React.memo(ChatDivider);

export default function ChatContent({ chatId }) {
	const messagesContainerRef = useRef(null);
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	const { sendSms } = useSendSms();
	const { connectionStatus, socket } = useChatSocket();

	const [messages, setMessages] = useState([]);
	const [who, setWho] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [localMessages, setLocalMessages] = useState([]);

	// ---------------------------------------------------------------------------------------------------------------------
	// MOCK: новые сообщения каждые 12 секунд
	useEffect(() => {
		if (connectionStatus !== 'mock') return;

		const interval = setInterval(() => {
			const newMsgId = Date.now();
			const newMsg = {
				id: newMsgId,
				from_id: 540, // Это НЕ текущий пользователь, поэтому будет входящим сообщением
				text: `Тестовое сообщение #${newMsgId}`,
				answer: null,
				to: { surname: 'Кошелев', name: 'Александр', id: 46 },
				created_at: Math.floor(Date.now() / 100),
				updated_at: Math.floor(Date.now() / 100),
			};
			setMessages((prev) => [...prev, newMsg]);
		}, 12000);

		return () => clearInterval(interval);
	}, [connectionStatus]);
	// /--------------------------------------------------------------------------------------------------------------------

	// Функция для определения отправителя сообщения
	const getMessageSenderId = useCallback((msg) => {
		// PRODMODE формат: данные от Laravel
		if (msg.right?.from_id) return msg.right.from_id;
		if (msg.from_id) return msg.from_id;
		if (msg.from?.id) return msg.from.id;
		return null;
	}, []);

	// Функция для нормализации сообщения
	const normalizeMessage = useCallback(
		(msg) => {
			const senderId = getMessageSenderId(msg);
			const isSelf = senderId === currentUserId || msg.isLocal;

			return {
				id: msg.id,
				text: msg.text || msg.left?.text,
				timestamp: msg.isLocal
					? msg.timestamp
					: (msg.updated_at || msg.created_at || msg.left?.updated_at || msg.left?.created_at) *
					  1000,
				role: isSelf ? 'self' : 'companion',
				senderName: isSelf ? 'Вы' : msg.senderName || who || 'Собеседник',
				isLocal: msg.isLocal || false,
				isSending: msg.isSending || false,
				// Сохраняем оригинальные данные для отладки
				_raw: msg,
			};
		},
		[currentUserId, who, getMessageSenderId]
	);

	useEffect(() => {
		setLoading(true);
		setError(null);
		setMessages([]);
		setLocalMessages([]);

		// MOCK режим
		if (connectionStatus === 'mock') {
			const sms = CHAT_MOCK?.content?.messages || [];
			setMessages(sms);
			setWho('Собеседник');
			setLoading(false);
			return;
		}

		// SOCKET режим
		if (connectionStatus === 'connected' && socket) {
			const handleMessageNew = (msg) => {
				console.log('📨 [CHAT] New message received:', {
					message: msg,
					senderId: getMessageSenderId(msg),
					currentUserId,
					isSelf: getMessageSenderId(msg) === currentUserId,
				});

				if ((!msg.text || msg.text.trim() === '') && (!msg.files || msg.files.length === 0)) return;

				// Проверяем chat_id в разных форматах
				const messageChatId = msg.chat_id || msg.left?.chat_id;
				if (messageChatId !== chatId) return;

				setMessages((prev) => {
					// Проверяем, есть ли локальное сообщение с таким же текстом
					const localIndex = prev.findIndex(
						(lMsg) =>
							lMsg.isLocal &&
							lMsg.text === (msg.text || msg.left?.text) &&
							getMessageSenderId(lMsg) === getMessageSenderId(msg)
					);

					if (localIndex >= 0) {
						const newPrev = [...prev];
						newPrev[localIndex] = {
							...newPrev[localIndex],
							id: msg.id || msg.left?.id,
							isLocal: false,
							isSending: false,
						};
						return newPrev;
					}

					return [...prev, msg];
				});
			};

			const handleMessageUpdate = (updatedMsg) => {
				setMessages((prev) =>
					prev.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m))
				);
			};

			// Подписываемся на правильные события WebSocket
			socket.emit('room:join', chatId);
			socket.on('sms:new_message', handleMessageNew);
			socket.on('sms:update_message', handleMessageUpdate);

			setLoading(false);

			return () => {
				socket.emit('room:leave', chatId);
				socket.off('sms:new_message', handleMessageNew);
				socket.off('sms:update_message', handleMessageUpdate);
			};
		}

		// fallback
		if (connectionStatus === 'disconnected') {
			const sms = CHAT_MOCK?.content?.messages || [];
			setMessages(sms);
			setWho('Собеседник');
			setLoading(false);
		}
	}, [chatId, socket, connectionStatus, currentUserId, getMessageSenderId]);

	// --- Объединяем серверные и локальные сообщения ---
	const allMessages = useMemo(() => {
		const existingIds = new Set(messages.map((msg) => msg.id?.toString()));
		const filteredLocal = localMessages.filter((lMsg) => !existingIds.has(lMsg.id?.toString()));
		const combined = [...messages, ...filteredLocal];

		return combined
			.map(normalizeMessage)
			.filter((msg) => msg.text) // Фильтруем сообщения без текста
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [messages, localMessages, normalizeMessage]);

	// --- Разделители по датам ---
	const formatChatDate = useCallback((ts) => {
		const d = new Date(ts);
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
			setMessages((prev) => [...prev, newLocalMsg]);

			try {
				const res = await sendSms({ to: chatId, text: text.trim(), answer: null });

				if (res?.data?.id) {
					setMessages((prev) =>
						prev.map((m) =>
							m.id === newLocalMsg.id
								? { ...m, id: res.data.id, isLocal: false, isSending: false }
								: m
						)
					);
					setLocalMessages((prev) => prev.filter((m) => m.id !== newLocalMsg.id));
				} else {
					setMessages((prev) =>
						prev.map((m) => (m.id === newLocalMsg.id ? { ...m, isSending: false } : m))
					);
				}
			} catch (err) {
				setLocalMessages((prev) => prev.filter((msg) => msg.id !== newLocalMsg.id));
				setMessages((prev) => prev.filter((msg) => msg.id !== newLocalMsg.id));
				message.error(err.message || 'Ошибка при отправке сообщения');
			}
		},
		[chatId, sendSms, currentUserId]
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
					<span>{who || 'Собеседник'}</span>
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
