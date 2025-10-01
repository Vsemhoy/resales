import { useState, useMemo, useCallback, useEffect } from 'react';
import { Layout, List, message, Button } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useUserData } from '../../../context/UserDataContext';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { useCompanion } from '../../../hooks/sms/useCompanion';
import { useChatMessages } from '../../../hooks/sms/useChatMessages';
import { nanoid } from 'nanoid';
import { ChatDivider } from './ChatDivider';
import { ChatInput } from './ChatInput';
import styles from './style/Chat.module.css';
import { MOCK } from '../mock/mock';
const { Content, Footer } = Layout;
const generateUUID = () => nanoid(8);

export default function ChatContent({ chatId }) {
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	const getRole = useCompanion(currentUserId);

	// ИСПОЛЬЗУЕМ ТОЛЬКО HTTP ДАННЫЕ С POLLING
	const {
		data: smsList = [],
		loading,
		error,
		refetch,
	} = useChatMessages({
		chatId,
		mock: MOCK,
	});
	const { sendSms } = useSendSms();

	const [localMessages, setLocalMessages] = useState([]);
	const [lastUpdate, setLastUpdate] = useState(Date.now());

	// Автообновление при открытии чата
	useEffect(() => {
		if (chatId) {
			const interval = setInterval(() => {
				console.log(`[ChatContent] Auto-refresh for chat ${chatId}`);
				refetch();
				setLastUpdate(Date.now());
			}, 8000); // Обновляем каждые 8 секунд в активном чате

			return () => clearInterval(interval);
		}
	}, [chatId, refetch]);

	const handleManualRefresh = useCallback(() => {
		console.log('Ручное обновление чата...');
		refetch();
		setLastUpdate(Date.now());
		message.info('Сообщения обновлены');
	}, [refetch]);

	const allMessages = useMemo(() => {
		const filteredLocal = localMessages.filter((msg) => msg.chat_id === chatId);
		const combined = [...smsList, ...filteredLocal];

		return combined
			.map((msg) => {
				const isLocal = 'timestamp' in msg && typeof msg.timestamp === 'number';
				const timestamp = isLocal ? msg.timestamp : (msg.updated_at || msg.created_at) * 1000;
				const role = isLocal ? 'self' : getRole(msg);

				return {
					id: msg.id || generateUUID(),
					text: msg.text,
					timestamp,
					time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					role,
					senderName:
						role === 'self' ? 'Вы' : `${msg.from?.name ?? ''} ${msg.from?.surname ?? ''}`.trim(),
					isLocal, // Помечаем локальные сообщения
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [smsList, localMessages, getRole, chatId]);

	const handleSend = useCallback(
		async (text) => {
			const newLocalMsg = {
				id: generateUUID(),
				chat_id: chatId,
				text,
				timestamp: Date.now(),
				from: { id: currentUserId, name: 'Вы', surname: '' },
				to: { id: chatId },
			};
			setLocalMessages((prev) => [...prev, newLocalMsg]);

			try {
				await sendSms({ to: chatId, text, answer: null });
				// После успешной отправки обновляем сообщения
				setTimeout(() => {
					refetch();
				}, 1000);
			} catch (err) {
				message.error('Ошибка при отправке сообщения');
				console.error('Ошибка при отправке сообщения:', err);
				// Удаляем локальное сообщение при ошибке
				setLocalMessages((prev) => prev.filter((msg) => msg.id !== newLocalMsg.id));
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
