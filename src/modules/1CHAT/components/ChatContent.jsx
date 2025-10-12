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
				from_id: 540,
				text: `Тестовое сообщение #${newMsgId}`,
				answer: null,
				to: { surname: 'Кошелев', name: 'Александр', id: 46 },
				created_at: Math.floor(Date.now() / 1000),
				updated_at: Math.floor(Date.now() / 1000),
			};
			setMessages((prev) => [...prev, newMsg]);
		}, 12000);

		return () => clearInterval(interval);
	}, [connectionStatus]);
	// /--------------------------------------------------------------------------------------------------------------------

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
				if ((!msg.text || msg.text.trim() === '') && (!msg.files || msg.files.length === 0)) return;
				if (msg.chat_id !== chatId) return;

				setMessages((prev) => {
					// проверяем, есть ли локальное сообщение с таким же текстом и отправителем
					const localIndex = prev.findIndex(
						(lMsg) =>
							lMsg.isLocal &&
							lMsg.text === msg.text &&
							lMsg.from.id === msg.from_id &&
							lMsg.chat_id === msg.chat_id
					);

					if (localIndex >= 0) {
						const newPrev = [...prev];
						newPrev[localIndex] = {
							...newPrev[localIndex],
							id: msg.id,
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

			socket.emit('joinRoom', { chatId });
			socket.on('message:new', handleMessageNew);
			socket.on('message:update', handleMessageUpdate);

			setLoading(false);

			return () => {
				socket.emit('leaveRoom', { chatId });
				socket.off('message:new', handleMessageNew);
				socket.off('message:update', handleMessageUpdate);
			};
		}

		// fallback
		if (connectionStatus === 'disconnected') {
			const sms = CHAT_MOCK?.content?.messages || [];
			setMessages(sms);
			setWho('Собеседник');
			setLoading(false);
		}
	}, [chatId, socket, connectionStatus]);

	// --- Объединяем серверные и локальные сообщения ---
	const allMessages = useMemo(() => {
		const existingIds = new Set(messages.map((msg) => msg.id?.toString()));
		const filteredLocal = localMessages.filter((lMsg) => !existingIds.has(lMsg.id?.toString()));
		const combined = [...messages, ...filteredLocal];

		return combined
			.map((msg) => {
				const isLocal = msg.isLocal || false;
				const timestamp = isLocal ? msg.timestamp : (msg.updated_at || msg.created_at) * 1000;

				const isSelf = msg.from_id === currentUserId || msg.isLocal;
				const role = isSelf ? 'self' : 'companion';
				const senderName = isSelf ? 'Вы' : msg.senderName || who || 'Собеседник';

				return {
					id: msg.id || generateUUID(),
					text: msg.text,
					timestamp,
					time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					role,
					senderName,
					isLocal,
					isSending: msg.isSending || false,
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [messages, localMessages, currentUserId, who]);

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
				from: { id: currentUserId },
				isLocal: true,
				isSending: true,
			};

			setLocalMessages((prev) => [...prev, newLocalMsg]);
			setMessages((prev) => [...prev, newLocalMsg]); // добавляем сразу в общие сообщения

			try {
				const res = await sendSms({ to: chatId, text: text.trim(), answer: null });

				// если сервер вернул реальный id, заменяем временный
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
					// для mock режима просто помечаем как отправлено
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
