import styles from './style/Chat.module.css';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useUserData } from '../../../context/UserDataContext';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { useSms } from '../../../hooks/sms/useSms';

import { Layout, message } from 'antd';
// import { SyncOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { ChatInput } from './ChatInput';
// import { MOCK } from '../mock/mock';
import { CHAT_MOCK } from '../mock/mock';

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
		who,
		loading,
		error,
		// refetch,
	} = useSms({
		chatId,
		mock: CHAT_MOCK,
	});

	// Фильтруем сообщения по chat_id вручную
	// const smsList = useMemo(() => {
	// 	// if (!chatId) return [];

	// 	const filtered = allSmsList.filter((msg) => {
	// 		const msgChatId = parseInt(msg.chatId);
	// 		const targetChatId = parseInt(chatId);
	// 		return msgChatId === targetChatId;
	// 	});

	//           const msgChatId = msg.chatId ? parseInt(msg.chatId) : null;
	//           const targetChatId = parseInt(chatId);

	//           if (isNaN(msgChatId) || isNaN(targetChatId)) {
	//               console.log('⚠️ Некорректный chatId:', {msgChatId, targetChatId, msg});
	//               return false;
	//           }

		const allMessages = useMemo(() => {
								if (!smsList) return [];

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
							}).sort((a, b) => a.timestamp - b.timestamp);
		}, [localMessages, chatId, allSmsList, currentUserId]);

	//             // Определяем отправителя
	//             const isSelf = msg.from_id === currentUserId || msg.from?.id === currentUserId;
	//             const role = isLocal ? 'self' : isSelf ? 'self' : 'companion';

	//             let senderName = 'Неизвестный';
	//             if (role === 'self') {
	//                 senderName = 'Вы';
	//             } else {
	//                 senderName = who || 'Неизвестный';
	//             }

	//             return {
	//                 id: msg.id || generateUUID(),
	//                 text: msg.text || '',
	//                 timestamp,
	//                 time: new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
	//                 role,
	//                 senderName,
	//                 isLocal,
	//                 isSending: msg.isSending || false,
	//             };
	//         })
	//         .sort((a, b) => a.timestamp - b.timestamp);
	// }, [smsList, localMessages, chatId, currentUserId, who]);

	// Функция для скролла к последнему сообщению
	const scrollToBottom = useCallback(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, []);
	useEffect(() => {
		if (error) {
			console.error('🚨 Ошибка загрузки сообщений:', error);
			message.error('Ошибка загрузки сообщений');
		}
	}, [error]);
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

	// 	const newLocalMsg = {
	// 		id: generateUUID(),
	// 		chatId: chatId,
	// 		text: text.trim(),
	// 		timestamp: Date.now(),
	// 		from: { id: currentUserId },
	// 		to: { id: chatId },
	// 		isLocal: true,
	// 		isSending: true, // Сообщение отправляется
	// 	};
	// }, [allSmsList, smsList, allMessages, currentUserId, chatId, loading, error, who]);

	const handleSend = useCallback(
		async (text) => {
			if (!text.trim()) return;

			const newLocalMsg = {
				id: generateUUID(),
				chatId: chatId,
				text: text.trim(),
				timestamp: Date.now(),
				from: { id: currentUserId },
				to: { id: chatId },
				isLocal: true,
				isSending: true,
			};

			// Сразу добавляем сообщение в чат
			setLocalMessages((prev) => [...prev, newLocalMsg]);

			try {
				await sendSms({ to: chatId, text: text.trim(), answer: null });

				// После успешной отправки меняем статус
				setLocalMessages((prev) =>
					prev.map((msg) => (msg.id === newLocalMsg.id ? { ...msg, isSending: false } : msg))
				);
			} catch (err) {
				// При ошибке удаляем сообщение
				setLocalMessages((prev) => prev.filter((msg) => msg.id !== newLocalMsg.id));
				message.error(err.message || 'Ошибка при отправке сообщения');
			}
		},
		[chatId, sendSms, currentUserId]
	);

	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.chatContent}>
				<div className={styles.chatHeader}>
					<span>{chatId === 'saved' ? 'Сохранённое' : who || 'Загрузка...'}</span>
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
