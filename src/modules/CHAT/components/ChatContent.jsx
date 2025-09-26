import { useState, useMemo, useCallback } from 'react';
import { Layout, List, Input, Button, Popover, Space, message } from 'antd';
import { SendOutlined, SmileOutlined, FileAddOutlined } from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import { useUserData } from '../../../context/UserDataContext';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { useCompanion } from '../../../hooks/sms/useCompanion';
import { useChatMessages } from '../../../hooks/sms/useChatMessages';
import { nanoid } from 'nanoid';
import { ChatDivider } from './ChatDivider';
import styles from './style/Chat.module.css';
import { MOCK } from '../mock/mock';

const { Content, Footer } = Layout;

const generateUUID = () => nanoid(8);

function injectDayDividers(messages) {
	const result = [];
	let lastDate = null;
	const shortWeekdays = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

	messages.forEach((msg) => {
		const dateObj = new Date(msg.timestamp);
		const weekdayShort = shortWeekdays[dateObj.getDay()];
		const datePart = dateObj.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});

		const currentDate = `${weekdayShort}, ${datePart}`;

		if (currentDate !== lastDate) {
			lastDate = currentDate;
			result.push({
				type: 'divider',
				key: `divider-${currentDate}`,
				date: currentDate.charAt(0).toUpperCase() + currentDate.slice(1),
			});
		}

		result.push({ ...msg, type: 'message' });
	});

	return result;
}

export default function ChatContent({ chatId }) {
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	const getRole = useCompanion(currentUserId);

	// получаем историю + live через useChatMessages
	const { data: smsList = [], loading, error } = useChatMessages({ chatId, mock: MOCK });

	const { sendSms, loading: sending } = useSendSms();

	const [text, setText] = useState('');
	const [showPicker, setShowPicker] = useState(false);
	const [localMessages, setLocalMessages] = useState([]);

	// объединяем сообщения из useChatMessages и локальные (до подтверждения с сервера)

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
					time: new Date(timestamp).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					}),
					role,
					senderName:
						role === 'self' ? 'Вы' : `${msg.from?.name ?? ''} ${msg.from?.surname ?? ''}`.trim(),
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [smsList, localMessages, getRole, chatId]);

	const messagesWithDividers = useMemo(() => injectDayDividers(allMessages), [allMessages]);

	const handleSend = useCallback(async () => {
		if (!text.trim()) return;

		const newLocalMsg = {
			id: generateUUID(),
			chat_id: chatId,
			text: text.trim(),
			timestamp: Date.now(),
		};

		setLocalMessages((prev) => [...prev, newLocalMsg]);
		setText('');

		try {
			await sendSms({
				to: chatId,
				text: newLocalMsg.text,
				answer: null,
			});
		} catch (err) {
			message.error('Ошибка при отправке сообщения');
			console.error('Ошибка при отправке сообщения:', err);
		}
	}, [text, chatId, sendSms]);

	const onEmojiClick = useCallback((emojiData) => {
		setText((prev) => prev + emojiData.emoji);
		setShowPicker(false);
	}, []);

	if (error) {
		return <div className={styles.error}>Ошибка загрузки: {error}</div>;
	}

	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.messages}>
				{loading ? (
					<p className={styles.loading}>Загрузка сообщений...</p>
				) : allMessages.length === 0 ? (
					<p className={styles.empty}>Нет сообщений</p>
				) : (
					<List
						dataSource={messagesWithDividers}
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
				<Space className={styles.spaceContainer}>
					<Popover
						content={<EmojiPicker onEmojiClick={onEmojiClick} />}
						trigger="hover"
						open={showPicker}
						onOpenChange={setShowPicker}
						placement="topRight"
					>
						<Button icon={<SmileOutlined />} />
					</Popover>

					<Button icon={<FileAddOutlined />} />

					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Введите сообщение..."
						style={{ flex: 1 }}
						onPressEnter={handleSend}
					/>

					<Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={sending} />
				</Space>
			</Footer>
		</Layout>
	);
}
