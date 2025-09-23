import { useState } from 'react';
import { useUserData } from '../../../context/UserDataContext';
import { useSms } from '../../../hooks/sms/useSms';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { useCompanion } from '../../../hooks/sms/useCompanion';
import { FormData } from './FormData';
import { ChatDivider } from './ChatDivider';

import { Layout, List, Input, Button, Popover, Space } from 'antd';
import { SendOutlined, SmileOutlined, FileAddOutlined } from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import styles from './style/Chat.module.css';
import { MOCK } from '../mock/mock';
import './style/Chat.module.css';

const { Content, Footer } = Layout;

// 💡 Генерация UUID (если нет поддержки crypto.randomUUID)
const generateUUID = () =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});

// 📅 Разделитель по дням
function injectDayDividers(messages) {
	const result = [];
	let lastDate = null;

	messages.forEach((msg) => {
		const currentDate = new Date(msg.timestamp).toDateString();
		if (currentDate !== lastDate) {
			lastDate = currentDate;
			result.push({
				type: 'divider',
				key: `divider-${currentDate}`,
				date: currentDate,
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

	const { data: smsList, loading } = useSms({ url: '/api/sms', mock: MOCK });
	const { sendSms, loading: sending } = useSendSms();

	const [text, setText] = useState('');
	const [showPicker, setShowPicker] = useState(false);
	const [localMessages, setLocalMessages] = useState([]);

	// 🔄 Комбинируем сообщения
	const combinedMessages = [...(smsList || []), ...localMessages]
		.filter((msg) => msg.chat_id === chatId)
		.map((msg) => {
			const isLocal = Boolean(msg.timestamp); // локальные уже имеют timestamp в ms
			const ts = isLocal ? msg.timestamp : msg.updated_at * 1000;

			return {
				id: msg.id,
				role: isLocal ? 'self' : getRole(msg), // для серверных определить роль
				text: msg.text,
				timestamp: ts,
				time: new Date(ts).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				}),
				senderName:
					isLocal || getRole(msg) === 'self' ? 'Вы' : `${msg.from.name} ${msg.from.surname}`,
				type: 'message',
			};
		})
		.sort((a, b) => a.timestamp - b.timestamp);

	const messagesWithDividers = injectDayDividers(combinedMessages);

	const handleSend = async () => {
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
			console.error('Ошибка отправки', err);
		}
	};

	const onEmojiClick = (emojiData) => {
		setText((prev) => prev + emojiData.emoji);
		setShowPicker(false);
	};

	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.messages}>
				{loading ? (
					<p>Загрузка...</p>
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
