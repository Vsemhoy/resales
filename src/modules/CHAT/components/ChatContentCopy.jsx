import styles from './style/Chat.module.css';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useUserData } from '../../../context/UserDataContext';
// import { useSendSms } from '../../../hooks/sms/useSendSms';
// import { useChatSocket } from '../../../context/ChatSocketContext';
// import { useChatRole } from '../../../hooks/sms/useChatRole.js';
// import { nanoid } from 'nanoid';
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

	const { Content, Footer } = Layout;
	const { messages, who, loading } = useSms({ chatId });

	// --- Объединяем серверные и локальные сообщения ---
	const allMessages = useMemo(() => {
		// const existingIds = new Set();
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

	const renderMessage = (message) =>
		+message.from_id === +currentUserId ? (
			<MemoChatSelfMsg key={message.id} message={message} />
		) : (
			<MemoChatIncomingMsg key={message.id} message={message} />
		);

	const messagesWithDividers = useMemo(() => {
		const items = [];
		let lastDayKey = null;

		for (const msg of allMessages) {
			const dayKey = new Date(msg.created_at).toDateString();
			if (lastDayKey !== dayKey) {
				items.push({ type: 'divider', id: `divider-${dayKey}`, timestamp: msg.created_at });
				lastDayKey = dayKey;
			}
			items.push({ type: 'msg', id: msg.id, message: msg });
		}
		return items;
	}, [allMessages]);
	// if (error) return <div className={styles.error}>Ошибка загрузки: {error}</div>;

	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.chatContent}>
				<div className={styles.chatHeader}>
					<span>{who ? who : 'Неизвестный собеседник'}</span>
					{/* <span>{DEBUGGER}</span> */}
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
									<MemoChatDivider key={item.id}>
										{dayjs(+item.timestamp * 1000).format('DD.MM.YY')}

										{/* {dayjs(item.timestamp)} */}
									</MemoChatDivider>
								) : (
									renderMessage(item.message)
								)
							)}
						</div>
					)}
				</div>
			</Content>
			<Footer className={styles['chat-input__footer']}>
				<ChatInput />
			</Footer>
		</Layout>
	);
}
