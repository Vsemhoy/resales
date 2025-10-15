import styles from './style/Chat.module.css';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useUserData } from '../../../context/UserDataContext';
import { useChatRole } from '../../../hooks/sms/useChatRole.js';
import { Layout } from 'antd';
import { ChatInput } from './ChatInput';
import { ChatDivider } from './ChatDivider';
import ChatSelfMsg from './ChatSelfMsg';
import ChatIncomingMsg from './ChatIncomingMsg';
import useSms from '../../../hooks/sms/useSms';

export default function ChatContentCopy({ chatId }) {
	const messagesContainerRef = useRef(null);
	const MemoChatSelfMsg = React.memo(ChatSelfMsg);
	const MemoChatIncomingMsg = React.memo(ChatIncomingMsg);
	const MemoChatDivider = React.memo(ChatDivider);
	const [localMessages, setLocalMessages] = useState([]);

	const userdata = useUserData();
	const currentUserId = userdata?.user?.id;

	// ✅ Проверяем, загружены ли данные пользователя
	const isUserDataLoaded = !!userdata;

	const { getRole, getDisplayName } = useChatRole(currentUserId);
	const { Content, Footer } = Layout;
	const { messages, who, loading } = useSms({ chatId });

	// --- Вспомогательные функции ---
	const getMessageSenderId = useCallback((msg) => {
		if (msg.isLocal) return msg.from_id;
		return msg.from_id;
	}, []);

	const getMessageTimestamp = useCallback((msg) => {
		if (msg.isLocal) return msg.timestamp;
		if (msg.created_at) return msg.created_at * 1000;
		return Date.now();
	}, []);

	const getMessageText = useCallback((msg) => {
		if (msg.isLocal) return msg.text;
		return msg.text;
	}, []);

	const getMessageId = useCallback((msg) => {
		if (msg.isLocal) return msg.id;
		return msg.id;
	}, []);

	// --- Функция нормализации с проверкой ---
	const normalizeMessage = useCallback(
		(msg) => {
			const senderId = getMessageSenderId(msg);
			const isSelf = senderId === currentUserId || msg.isLocal;

			// Используем хук для определения роли и имени
			const role = isSelf ? 'self' : getRole(msg);
			const displayName = isSelf ? 'Вы' : getDisplayName(msg, role, false);

			const timestamp = getMessageTimestamp(msg);
			const text = getMessageText(msg);
			const id = getMessageId(msg);

			// console.log('🕒 [CHAT] Normalizing message:', {
			// 	original: msg,
			// 	senderId,
			// 	currentUserId,
			// 	isSelf,
			// 	timestamp,
			// 	text,
			// 	id,
			// 	role,
			// 	displayName,
			// 	isLocal: msg.isLocal,
			// });

			const normalizedMsg = {
				id: id,
				text: text,
				timestamp: timestamp,
				role: role,
				senderName: who ? who : 'Неизвестный собеседник',
				isLocal: msg.isLocal || false,
				isSending: msg.isSending || false,
				_raw: msg,
			};

			return normalizedMsg;
		},
		[
			who,
			currentUserId,
			getMessageSenderId,
			getRole,
			getDisplayName,
			getMessageTimestamp,
			getMessageText,
			getMessageId,
		]
	);

	// --- Объединяем и нормализуем сообщения ---
	const allMessages = useMemo(() => {
		if (!isUserDataLoaded) {
			console.log('⏳ [CHAT] User data not loaded yet, skipping normalization');
			return [];
		}

		const combined = [...messages, ...localMessages];

		const existingIds = new Set();
		const uniqueMessages = combined.filter((msg) => {
			const id = getMessageId(msg);
			if (existingIds.has(id?.toString())) {
				return false;
			}
			existingIds.add(id?.toString());
			return true;
		});

		const normalized = uniqueMessages
			.map(normalizeMessage)
			.filter((msg) => msg.text && msg.text.trim() !== '')
			.sort((a, b) => a.timestamp - b.timestamp);

		console.log('📊 [CHAT] All normalized messages:', normalized);
		return normalized;
	}, [messages, localMessages, normalizeMessage, getMessageId, isUserDataLoaded]);

	// --- Рендер сообщений ---
	const renderMessage = useCallback((message) => {
		return message.role === 'self' ? (
			<MemoChatSelfMsg key={message.id} message={message} />
		) : (
			<MemoChatIncomingMsg key={message.id} message={message} />
		);
	}, []);

	// --- Автоскролл ---
	useEffect(() => {
		if (messagesContainerRef.current && allMessages.length > 0) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, [allMessages]);

	// --- Разделители по датам ---
	const messagesWithDividers = useMemo(() => {
		if (allMessages.length === 0) return [];

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

	// ✅ Объединенная проверка загрузки
	const showLoading = !isUserDataLoaded || (loading && allMessages.length === 0);
	const showEmpty = isUserDataLoaded && !loading && allMessages.length === 0;
	const showMessages = isUserDataLoaded && allMessages.length > 0;

	// ✅ Единый return с правильными условиями
	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.chatContent}>
				<div className={styles.chatHeader}>
					<span>{!isUserDataLoaded ? 'Загрузка...' : who ? who : 'Неизвестный собеседник'}</span>
				</div>
				<div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
					{showLoading ? (
						<p className={styles.loading}>
							{!isUserDataLoaded ? 'Загрузка данных пользователя...' : 'Загрузка сообщений...'}
						</p>
					) : showEmpty ? (
						<p className={styles.empty}>Нет сообщений</p>
					) : showMessages ? (
						<div
							ref={messagesContainerRef}
							className={styles.messagesList}
							style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
						>
							{messagesWithDividers.map((item) =>
								item.type === 'divider' ? (
									<MemoChatDivider key={item.id}>
										{dayjs(item.timestamp).format('DD.MM.YY')}
									</MemoChatDivider>
								) : (
									renderMessage(item.message)
								)
							)}
						</div>
					) : null}
				</div>
			</Content>
			<Footer className={styles['chat-input__footer']}>
				<ChatInput />
			</Footer>
		</Layout>
	);
}
