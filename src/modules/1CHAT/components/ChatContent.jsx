import styles from './style/Chat.module.css';
// import { PRODMODE } from '../../../config/config';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
// import { usePolling } from '../../../hooks/sms/usePolling';
import { useUserData } from '../../../context/UserDataContext';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { useSms } from '../../../hooks/sms/useSms';

import { Layout, message } from 'antd';
// import { SyncOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { ChatInput } from './ChatInput';
import { CHAT_MOCK } from '../mock/mock';
import { ChatDivider } from './ChatDivider';

// Импортируем новые компоненты сообщений
import ChatSelfMsg from './ChatSelfMsg';
import ChatIncomingMsg from './ChatIncomingMsg';

const { Content, Footer } = Layout;
const generateUUID = () => nanoid(8);

export default function ChatContent({ chatId }) {
	const messagesContainerRef = useRef(null);
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	const {
		data: allSmsList = [],
		loading,
		error,
		who,
		// refetch,
	} = useSms({
		chatId,
		mock: CHAT_MOCK,
	});

	// Polling для обновления сообщений
	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		refetch();
	// 	}, 1000);

	// 	return () => clearInterval(interval);
	// }, [refetch]);





	// Фильтруем сообщения по chat_id вручную
	// const smsList = useMemo(() => {
	// 	if (!chatId) return [];

	// 	const filtered = allSmsList.filter((msg) => {
	// 		const msgChatId = parseInt(msg.chat_id);
	// 		const targetChatId = parseInt(chatId);
	// 		return msgChatId === targetChatId;
	// 	});

	// 	console.log('🎯 Filtered messages for chat', chatId, ':', filtered);
	// 	return filtered;
	// }, [allSmsList, chatId]);

	const { sendSms, newId } = useSendSms();
	const [localMessages, setLocalMessages] = useState([]);
	// const [incomingMessages, setIncomingMessages] = useState([]);

	const allMessages = useMemo(() => {
		const existingIds = new Set(allSmsList.map((msg) => msg.id.toString()));
		const filteredLocal = localMessages.filter((lMsg) => !existingIds.has(lMsg.id.toString()));
		const combined = [...allSmsList, ...filteredLocal];

		return combined
			.map((msg) => {
				const isLocal = 'timestamp' in msg && typeof msg.timestamp === 'number';

				let timestamp;
				if (isLocal) {
					timestamp = msg.timestamp;
				} else {
					timestamp = (msg.updated_at || msg.created_at) * 1000;
				}

				// Определяем отправителя
				const isSelf = msg.from_id === currentUserId;
				const role = isLocal ? 'self' : isSelf ? 'self' : 'companion';

				let senderName = 'Неизвестный';
				if (role === 'self') {
					senderName = 'Вы';
				} else {
					senderName = who;
				}

				return {
					id: msg.id || generateUUID(),
					text: msg.text || '',
					timestamp,
					time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					role,
					senderName,
					isLocal,
					// Добавляем статус отправки
					isSending: msg.isSending || false,
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [localMessages, allSmsList, currentUserId, who]);

	// --- Новая логика: группировка сообщений с разделителями по датам ---
	// Форматирует подпись для разделителя: Сегодня/Вчера/дд месяц yyyy
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

		// Пример: "12 октября 2025"
		return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
	}, []);

	// Создаём массив элементов с разделителями: [{ type: 'divider', id, timestamp }, { type: 'msg', message }]
	const messagesWithDividers = useMemo(() => {
		const items = [];
		let lastDayKey = null;

		for (const msg of allMessages) {
			const msgDate = new Date(msg.timestamp);
			const dayKey = msgDate.toDateString(); // уникально для дня в локальном часовом поясе

			if (lastDayKey !== dayKey) {
				// вставляем разделитель перед первым сообщением нового дня
				items.push({
					type: 'divider',
					id: `divider-${dayKey}`,
					timestamp: msg.timestamp,
				});
				lastDayKey = dayKey;
			}

			items.push({
				type: 'msg',
				id: msg.id,
				message: msg,
			});
		}

		return items;
	}, [allMessages]);
	// --- /Новая логика ---

	// Функция для скролла к последнему сообщению
	const scrollToBottom = useCallback(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, []);

	// Автоскролл при загрузке новых сообщений или смене чата
	useEffect(() => {
		if (chatId) {
			scrollToBottom();
		}
	}, [chatId, scrollToBottom]);

	// Автоскролл при отправке нового сообщения
	useEffect(() => {
		if (localMessages.length > 0) {
			scrollToBottom();
		}
	}, [localMessages, scrollToBottom]);

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
				to: { id: chatId },
				isLocal: true,
				isSending: true, // Сообщение отправляется
			};

			// Сразу добавляем сообщение в чат
			setLocalMessages((prev) => [...prev, newLocalMsg]);

			try {
				// Отправляем сообщение
				await sendSms({ to: chatId, text: text.trim(), answer: null });

				// После успешной отправки меняем статус
				setLocalMessages((prev) =>
					prev.map((msg) => (msg.id === newLocalMsg.id ? { ...msg, isSending: false } : msg))
				);
				// Сообщение остается в чате с обычным стилем
				if (newId) {
					newLocalMsg.id = newId;
				}
			} catch (err) {
				// При ошибке удаляем сообщение
				setLocalMessages((prev) => prev.filter((msg) => msg.id !== newLocalMsg.id));
				message.error(err.message || 'Ошибка при отправке сообщения');
			}
		},
		[chatId, sendSms, currentUserId, newId]
	);

	// Функция для рендеринга сообщений
	const renderMessage = (message) => {
		if (message.role === 'self') {
			return <ChatSelfMsg key={message.id} message={message} />;
		} else {
			return <ChatIncomingMsg key={message.id} message={message} />;
		}
	};

	if (error) return <div className={styles.error}>Ошибка загрузки: {error}</div>;

	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.chatContent}>
				<div className={styles.chatHeader}>
					<span>{chatId === 'saved' ? 'Сохранённое' : who}</span>
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
							style={{
								flex: 1,
								overflowY: 'auto',
								minHeight: 0,
							}}
						>
							{messagesWithDividers.map((item) =>
								item.type === 'divider' ? (
									<ChatDivider key={item.id}>{formatChatDate(item.timestamp)}</ChatDivider>
								) : (
									// renderMessage уже добавляет key для сообщения
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
