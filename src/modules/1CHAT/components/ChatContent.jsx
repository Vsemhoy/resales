import styles from './style/Chat.module.css';
// import { PRODMODE } from '../../../config/config';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
// import { usePolling } from '../../../hooks/sms/usePolling';
import { useUserData } from '../../../context/UserDataContext';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { useSms } from '../../../hooks/sms/useSms';

import { Layout, List, message, Button } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { ChatInput } from './ChatInput';
import { MOCK } from '../mock/mock';

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
		// refetch,
	} = useSms({
		url: '/api/sms',
		mock: MOCK,
	});

	// Фильтруем сообщения по chat_id вручную
	const smsList = useMemo(() => {
		if (!chatId) return [];

		const filtered = allSmsList.filter((msg) => {
			const msgChatId = parseInt(msg.chat_id);
			const targetChatId = parseInt(chatId);
			return msgChatId === targetChatId;
		});

		console.log('🎯 Filtered messages for chat', chatId, ':', filtered);
		return filtered;
	}, [allSmsList, chatId]);

	const { sendSms } = useSendSms();
	const [localMessages, setLocalMessages] = useState([]);

	const allMessages = useMemo(() => {
		const filteredLocal = localMessages.filter((msg) => msg.chat_id === chatId);
		const combined = [...smsList, ...filteredLocal];

		console.log('🔄 Processing messages:', {
			allSmsCount: allSmsList.length,
			filteredCount: smsList.length,
			localCount: filteredLocal.length,
			combinedCount: combined.length,
			chatId,
		});

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
				const isSelf = msg.from?.id === currentUserId;
				const role = isLocal ? 'self' : isSelf ? 'self' : 'companion';

				let senderName = 'Неизвестный';
				if (role === 'self') {
					senderName = 'Вы';
				} else {
					senderName = `${msg.from?.name || ''} ${msg.from?.surname || ''}`.trim() || 'Собеседник';
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
	}, [smsList, localMessages, chatId, allSmsList.length, currentUserId]);

	// Функция для скролла к последнему сообщению
	const scrollToBottom = useCallback(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, []);

	// Автоскролл при загрузке новых сообщений или смене чата
	useEffect(() => {
		if (allMessages.length > 0) {
			scrollToBottom();
		}
	}, [allMessages, scrollToBottom]);

	// Автоскролл при отправке нового сообщения
	useEffect(() => {
		if (localMessages.length > 0) {
			scrollToBottom();
		}
	}, [localMessages, scrollToBottom]);

	useEffect(() => {
		// Отладочная логика
		console.log('🔍 ChatContent Debug:', {
			chatId,
			currentUserId,
			allSmsListLength: allSmsList.length,
			smsListLength: smsList.length,
			loading,
			error,
		});
	}, [allSmsList, smsList, currentUserId, chatId, loading, error]);

	const handleSend = useCallback(
		async (text) => {
			if (!text.trim()) return;

			const newLocalMsg = {
				id: generateUUID(),
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
			} catch (err) {
				// При ошибке удаляем сообщение
				setLocalMessages((prev) => prev.filter((msg) => msg.id !== newLocalMsg.id));
				message.error(err.message || 'Ошибка при отправке сообщения');
			}
		},
		[chatId, sendSms, currentUserId]
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
					<span>
						{chatId === 'saved'
							? 'Сохранённое'
							: (() => {
									const msg = allSmsList.find((m) => m.chat_id === chatId);
									if (!msg) return 'Собеседник';
									const companion = msg.from?.id === currentUserId ? msg.to : msg.from;
									return (
										`${companion?.surname || ''} ${companion?.name || ''}`.trim() || 'Собеседник'
									);
							  })()}
					</span>
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
							{allMessages.map(renderMessage)}
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
