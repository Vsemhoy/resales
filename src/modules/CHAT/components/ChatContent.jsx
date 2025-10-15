import styles from './style/Chat.module.css';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useUserData } from '../../../context/UserDataContext';
import { Layout } from 'antd';
import { ChatInput } from './ChatInput';
import { ChatDivider } from './ChatDivider';
import ChatSelfMsg from './ChatSelfMsg';
import ChatIncomingMsg from './ChatIncomingMsg';
import useSms from '../../../hooks/sms/useSms';
import { useSendSms } from '../../../hooks/sms/useSendSms';

export default function ChatContent({ chatId }) {
	const { userdata } = useUserData();
	const messagesContainerRef = useRef(null);
	const MemoChatSelfMsg = React.memo(ChatSelfMsg);
	const MemoChatIncomingMsg = React.memo(ChatIncomingMsg);
	const MemoChatDivider = React.memo(ChatDivider);
	const [localMessages, setLocalMessages] = useState([]);
	const [currentUserId, setCuttentUserId] = useState(null);
	// ✅ Проверяем, загружены ли данные пользователя
	const isUserDataLoaded = !!userdata;

	const { Content, Footer } = Layout;
	const { messages, who, loading } = useSms({ chatId });
	const {
		sendSms,
		// loading,
		error,
		success,
		newId,
		timestamp,
	} = useSendSms();

	useEffect(() => {
		const localMsg = localMessages.find((msg) => +msg.timestamp === +timestamp);
		localMsg.id = newId;
	}, [newId, timestamp, localMessages]);

	// --- Вспомогательные функции ---
	const getMessageSenderId = useCallback((msg) => {
		if (msg.isLocal) return msg.from_id;
		return msg.from_id;
	}, []);

	const getMessageText = useCallback((msg) => {
		if (msg.isLocal) return msg.text;
		return msg.text;
	}, []);

	const getMessageId = useCallback((msg) => {
		if (msg.isLocal) return msg.id;
		return msg.id;
	}, []);

	useEffect(() => {
		console.log('[userdata: :OEDUBHNG:KJLSDHNBGV:KLSJDHNBGV:KLSDN: ]', userdata);
		setCuttentUserId(userdata?.user?.id);
	}, [userdata]);

	// --- Функция нормализации с проверкой ---
	const normalizeMessage = useCallback(
		(msg) => {
			const senderId = getMessageSenderId(msg);

			const isSelf = senderId === currentUserId;
			console.log('currentUserId: ', currentUserId, 'isSelf: ', isSelf);

			const text = getMessageText(msg);
			const id = getMessageId(msg);

			const normalizedMsg = {
				fromId: msg.from_id,
				id: id,
				text: text,
				timestamp: msg.created_at,
				isSelf,
				senderName: +currentUserId !== +senderId ? who : 'Вы',
				isLocal: msg.isLocal || false,
				isSending: msg.isSending || false,
				_raw: msg,
			};

			return normalizedMsg;
		},
		[who, currentUserId, getMessageSenderId, getMessageText, getMessageId]
	);

	// ===============================================================================================================================================================================================
	// ===============================================================================================================================================================================================
	// ===============================================================================================================================================================================================
	// ===============================================================================================================================================================================================
	const handleSend = (trimmed) => {
		sendSms({ to: chatId, text: trimmed, answer: null, timestamp: Date.now() });
		const localMsg = {
			fromId: currentUserId,
			id: Date.now(),
			text: trimmed,
			timestamp: Date.now(),
			isSelf: true,
			senderName: 'Вы',
			isLocal: true,
			isSending: true,
		};
		setLocalMessages([...localMessages, localMsg]);
	};
	// ===============================================================================================================================================================================================
	// ===============================================================================================================================================================================================
	// ===============================================================================================================================================================================================
	// ===============================================================================================================================================================================================

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
			.filter((msg) => msg.text && msg.text.trim() !== '') //TODO Вынести trim, он не работает
			.sort((a, b) => a.timestamp - b.timestamp);

		console.log('📊 [CHAT] All normalized messages:', normalized);
		return normalized;
	}, [messages, localMessages, normalizeMessage, getMessageId, isUserDataLoaded]);

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
					<span>{currentUserId}</span>
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
										{dayjs(+item.timestamp * 1000).format('DD.MM.YY')}
									</MemoChatDivider>
								) : +item.message.fromId === +currentUserId ? (
									<MemoChatSelfMsg key={item.message.id} message={item.message} />
								) : (
									<MemoChatIncomingMsg key={item.message.id} message={item.message} />
								)
							)}
						</div>
					) : null}
				</div>
			</Content>
			<Footer className={styles['chat-input__footer']}>
				<ChatInput onSend={handleSend} />
			</Footer>
		</Layout>
	);
}
