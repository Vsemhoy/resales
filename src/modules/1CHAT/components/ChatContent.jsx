import styles from './style/Chat.module.css';
// import { PRODMODE } from '../../../config/config';

import { useState, useMemo, useCallback, useEffect } from 'react';
// import { usePolling } from '../../../hooks/sms/usePolling';
import { useUserData } from '../../../context/UserDataContext';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { useCompanion } from '../../../hooks/sms/useCompanion';
import { useSms } from '../../../hooks/sms/useSms'; // ИМПОРТИРУЕМ useSms вместо useChatMessages

import { Layout, List, message, Button } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { ChatInput } from './ChatInput';
import { MOCK } from '../mock/mock';

const { Content, Footer } = Layout;
const generateUUID = () => nanoid(8);

export default function ChatContent({ chatId }) {
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	const getRole = useCompanion(currentUserId);

	// ЗАМЕНЯЕМ useChatMessages на useSms + ручную фильтрацию
	const {
		data: allSmsList = [],
		loading,
		error,
		refetch,
	} = useSms({
		url: '/api/sms',
		mock: MOCK,
	});

	// Фильтруем сообщения по chat_id вручную
	const smsList = useMemo(() => {
		if (!chatId) return [];

		const filtered = allSmsList.filter((msg) => {
			// Преобразуем оба значения к числу для сравнения
			const msgChatId = parseInt(msg.chat_id);
			const targetChatId = parseInt(chatId);
			return msgChatId === targetChatId;
		});

		// console.log(
		// 	`🎯 Manual filtering: ${allSmsList.length} total -> ${filtered.length} for chat ${chatId}`,
		// 	filtered
		// );
		return filtered;
	}, [allSmsList, chatId]);

	// Отладка
	useEffect(() => {
		// console.log('🔍 DEBUG ChatContent:');
		// console.log('- chatId:', chatId);
		// console.log('- currentUserId:', currentUserId);
		// console.log('- allSmsList length:', allSmsList.length);
		// console.log('- filtered smsList length:', smsList.length);
		// console.log('- loading:', loading);
		// console.log('- error:', error);
		// if (smsList.length > 0) {
		// 	console.log('- Первое сообщение в smsList:', smsList[0]);
		// 	console.log(
		// 		'- Все chat_id в allSmsList:',
		// 		allSmsList.map((msg) => msg.chat_id)
		// 	);
		// }
	}, [allSmsList, smsList, currentUserId, chatId, loading, error]);

	const { sendSms } = useSendSms();
	const [localMessages, setLocalMessages] = useState([]);
	const [lastUpdate, setLastUpdate] = useState(Date.now());

	// Polling для чата - уменьшаем интервал для тестирования
	// usePolling(
	// 	() => {
	// 		// console.log(`[ChatContent] Auto-refresh for chat ${chatId}`);
	// 		refetch();
	// 		setLastUpdate(Date.now());
	// 	},
	// 	10000, // Уменьшаем до 10 секунд для тестирования
	// 	!!chatId
	// );

	const handleManualRefresh = useCallback(() => {
		refetch();
		setLastUpdate(Date.now());
		message.info('Сообщения обновлены');
	}, [refetch]);

	const allMessages = useMemo(() => {
		const filteredLocal = localMessages.filter((msg) => msg.chat_id === chatId);

		const combined = [...smsList, ...filteredLocal];

		// console.log('🔄 Processing messages:', {
		// 	allSmsCount: allSmsList.length,
		// 	filteredCount: smsList.length,
		// 	localCount: filteredLocal.length,
		// 	combinedCount: combined.length,
		// 	chatId,
		// });

		return combined
			.map((msg) => {
				const isLocal = 'timestamp' in msg && typeof msg.timestamp === 'number';

				let timestamp;
				if (isLocal) {
					timestamp = msg.timestamp;
				} else {
					timestamp = (msg.updated_at || msg.created_at) * 1000;
				}

				const role = isLocal ? 'self' : getRole(msg);

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
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [smsList, localMessages, getRole, chatId, allSmsList.length]);

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
			};

			// console.log('📤 Sending message:', newLocalMsg);
			setLocalMessages((prev) => [...prev, newLocalMsg]);

			try {
				await sendSms({ to: chatId, text: text.trim(), answer: null });
				// console.log('✅ Message sent successfully');

				// Удаляем ТОЛЬКО это локальное сообщение после успешной отправки
				setTimeout(() => {
					// console.log('🗑️ Removing local message:', newLocalMsg.id);
					setLocalMessages((prev) => prev.filter((msg) => msg.id !== newLocalMsg.id));

					// Обновляем данные
					// console.log('🔄 Refetching after send...');
					refetch();
				}, 500);
			} catch (err) {
				// console.error('❌ Send message error:', err);
				// Удаляем локальное сообщение при ошибке
				setLocalMessages((prev) => prev.filter((msg) => msg.id !== newLocalMsg.id));
				message.error(err.message || 'Ошибка при отправке сообщения');
			}
		},
		[chatId, sendSms, refetch, currentUserId]
	);

	if (error) return <div className={styles.error}>Ошибка загрузки: {error}</div>;

	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.messages}>
				<div className={styles.chatHeader}>
					<Button
						icon={<SyncOutlined />}
						loading={loading}
						onClick={handleManualRefresh}
						size="small"
					>
						Обновить
					</Button>
					<span className={styles.lastUpdate}>
						Обновлено: {new Date(lastUpdate).toLocaleTimeString()}
					</span>
				</div>

				{loading && allMessages.length === 0 ? (
					<p className={styles.loading}>Загрузка сообщений...</p>
				) : allMessages.length === 0 ? (
					<p className={styles.empty}>Нет сообщений</p>
				) : (
					<List
						dataSource={allMessages}
						renderItem={(item) => (
							<List.Item
								key={item.id}
								className={`${styles.message} ${
									item.role === 'self' ? styles.myMessage : styles.otherMessage
								} ${item.isLocal ? styles.localMessage : ''}`}
							>
								<div
									className={`${styles.bubble} ${
										item.role === 'self' ? styles.myMessageBubble : styles.otherMessageBubble
									}`}
								>
									<div className={styles.senderName}>{item.senderName}</div>
									<span>{item.text}</span>
									<div className={styles.time}>
										{item.time}
										{item.isLocal && <span className={styles.sending}> • отправляется...</span>}
									</div>
								</div>
							</List.Item>
						)}
					/>
				)}
			</Content>

			<Footer className={styles['chat-input__footer']}>
				<ChatInput onSend={handleSend} />
			</Footer>
		</Layout>
	);
}
