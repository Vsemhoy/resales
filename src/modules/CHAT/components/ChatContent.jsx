import { useState, useMemo, useCallback } from 'react';
import { Layout, List, message } from 'antd';
import { useUserData } from '../../../context/UserDataContext';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { useCompanion } from '../../../hooks/sms/useCompanion';
import { useChatMessages } from '../../../hooks/sms/useChatMessages';
import { nanoid } from 'nanoid';
import { ChatDivider } from './ChatDivider';
import { ChatInput } from './ChatInput';
import styles from './style/Chat.module.css';
import { MOCK } from '../mock/mock';
import { injectDayDividersHelpers } from '../../../components/helpers/InjectDayDividersHelpers';
const { Content, Footer } = Layout;
const generateUUID = () => nanoid(8);

export default function ChatContent({ chatId }) {
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	const getRole = useCompanion(currentUserId);

	const { data: smsList = [], loading, error } = useChatMessages({ chatId, mock: MOCK });
	const { sendSms } = useSendSms();

	const [localMessages, setLocalMessages] = useState([]);

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
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [smsList, localMessages, getRole, chatId]);

	// const messagesWithDividers = useMemo(() => injectDayDividers(allMessages), [allMessages]);

	const handleSend = useCallback(
		async (text) => {
			const newLocalMsg = { id: generateUUID(), chat_id: chatId, text, timestamp: Date.now() };
			setLocalMessages((prev) => [...prev, newLocalMsg]);

			try {
				await sendSms({ to: chatId, text, answer: null });
			} catch (err) {
				message.error('Ошибка при отправке сообщения');
				console.error('Ошибка при отправке сообщения:', err);
			}
		},
		[chatId, sendSms]
	);

	if (error) return <div className={styles.error}>Ошибка загрузки: {error}</div>;

	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.messages}>
				{loading ? (
					<p className={styles.loading}>Загрузка сообщений...</p>
				) : allMessages.length === 0 ? (
					<p className={styles.empty}>Нет сообщений</p>
				) : (
					<List
						// dataSource={messagesWithDividers}
						renderItem={(item) =>
							item.type === 'divider' ? (
								<ChatDivider key={item.key} date={item.date} />
							) : (
								<List.Item
									key={item.id}
									className={`${styles.message} ${
										item.role === 'self' ? styles.myMessage : styles.otherMessage
									}`}
								>
									<div
										className={`${styles.bubble} ${
											item.role === 'self' ? styles.myMessageBubble : styles.otherMessageBubble
										}`}
									>
										<div className={styles.senderName}>{item.senderName}</div>
										<span>{item.text}</span>
										<div className={styles.time}>{item.time}</div>
									</div>
								</List.Item>
							)
						}
					/>
				)}
			</Content>

			<Footer className={styles['chat-input__footer']}>
				<ChatInput onSend={handleSend} />
			</Footer>
		</Layout>
	);
}
