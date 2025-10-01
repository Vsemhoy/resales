import styles from './style/Chat.module.css';
import { PRODMODE } from '../../../config/config';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePolling } from '../../../hooks/sms/usePolling';
import { useUserData } from '../../../context/UserDataContext';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { useCompanion } from '../../../hooks/sms/useCompanion';
import { useChatMessages } from '../../../hooks/sms/useChatMessages';

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

	const {
		data: smsList = [],
		loading,
		error,
		refetch,
	} = useChatMessages({
		chatId,
		mock: MOCK,
	});

	// Тестовые сообщения для PRODUCTION (если нужно)
	const getTestMessages = useCallback(() => {
		if (PRODMODE && chatId) {
			return [
				{
					id: 1001,
					chat_id: parseInt(chatId),
					from: {
						surname: 'Иванов',
						name: 'Петр',
						id: 999,
					},
					to: {
						surname: 'Кошелев',
						name: 'Александр',
						id: 46,
					},
					text: 'Это тестовое сообщение от другого пользователя',
					status: false,
					created_at: Math.floor(Date.now() / 1000) - 3600,
					updated_at: Math.floor(Date.now() / 1000) - 3600,
				},
				{
					id: 1002,
					chat_id: parseInt(chatId),
					from: {
						surname: 'Сидорова',
						name: 'Мария',
						id: 998,
					},
					to: {
						surname: 'Кошелев',
						name: 'Александр',
						id: 46,
					},
					text: 'Еще одно тестовое сообщение',
					status: false,
					created_at: Math.floor(Date.now() / 1000) - 1800,
					updated_at: Math.floor(Date.now() / 1000) - 1800,
				},
			];
		}
		return [];
	}, [chatId]);

	// Отладка
	useEffect(() => {
		console.log('📱 SMS List from backend:', smsList);
		console.log('👤 Current User ID:', currentUserId);
		console.log('💬 Current Chat ID:', chatId);
	}, [smsList, currentUserId, chatId]);

	const { sendSms } = useSendSms();
	const [localMessages, setLocalMessages] = useState([]);
	const [lastUpdate, setLastUpdate] = useState(Date.now());

	// Polling для чата
	usePolling(
		() => {
			console.log(`[ChatContent] Auto-refresh for chat ${chatId}`);
			refetch();
			setLastUpdate(Date.now());
		},
		30000,
		!!chatId
	);

	const handleManualRefresh = useCallback(() => {
		refetch();
		setLastUpdate(Date.now());
		message.info('Сообщения обновлены');
	}, [refetch]);

	const allMessages = useMemo(() => {
		const filteredLocal = localMessages.filter((msg) => msg.chat_id === chatId);

		// УБИРАЕМ фильтрацию - useChatMessages уже вернул отфильтрованные данные
		// const filteredSms = smsList.filter((msg) => msg.chat_id === parseInt(chatId));

		// Тестовые сообщения (опционально)
		const testMessages = PRODMODE ? getTestMessages() : [];

		const combined = [...smsList, ...testMessages, ...filteredLocal];

		console.log('🔄 Processing messages:', {
			smsCount: smsList.length,
			testCount: testMessages.length,
			localCount: filteredLocal.length,
			combinedCount: combined.length,
			chatId,
		});

		return combined
			.map((msg) => {
				const isLocal = 'timestamp' in msg && typeof msg.timestamp === 'number';

				// Timestamp
				let timestamp;
				if (isLocal) {
					timestamp = msg.timestamp;
				} else {
					timestamp = (msg.updated_at || msg.created_at) * 1000;
				}

				const role = isLocal ? 'self' : getRole(msg);

				// Имя отправителя
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
	}, [smsList, localMessages, getRole, chatId, getTestMessages]);

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

			// Оптимистичное обновление
			setLocalMessages((prev) => [...prev, newLocalMsg]);

			try {
				await sendSms({ to: chatId, text: text.trim(), answer: null });

				// Успех - обновляем и удаляем локальное сообщение
				setTimeout(() => {
					refetch();
					setLocalMessages((prev) => prev.filter((msg) => msg.id !== newLocalMsg.id));
				}, 500);
			} catch (err) {
				console.error('❌ Send message error:', err);
				// Ошибка - удаляем локальное сообщение
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
