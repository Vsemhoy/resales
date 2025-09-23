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

// 🔧 Вставка компонентов ChatDivider при смене дня
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
	const [localMessages, setLocalMessages] = useState([]); // локальные отправленные сообщения

	// 📦 Комбинируем сообщения (сервер + локальные)
	const combinedMessages = (smsList || [])
		.filter((sms) => sms.chat_id === chatId)
		.map((sms) => ({
			id: sms.id,
			role: getRole(sms), // 'self' или 'companion'
			text: sms.text,
			timestamp: sms.updated_at * 1000,
			time: new Date(sms.updated_at * 1000).toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			}),
			senderName: getRole(sms) === 'self' ? 'Вы' : `${sms.from.name} ${sms.from.surname}`,
		}))
		.concat(
			localMessages
				.filter((msg) => msg.chat_id === chatId)
				.map((msg) => ({
					id: msg.id,
					role: 'self',
					text: msg.text,
					timestamp: msg.timestamp,
					time: new Date(msg.timestamp).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					}),
					senderName: 'Вы',
				}))
		)
		.sort((a, b) => a.timestamp - b.timestamp); // сортируем по времени

	// 🧩 Вставляем разделители дней
	const messagesWithDividers = injectDayDividers(combinedMessages);

	const handleSend = async () => {
		if (!text.trim()) return;

		const newLocalMsg = {
			id: crypto.randomUUID(), // надёжный уникальный id
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
					<p>loading...</p>
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
					{/* <FormData /> */}
					<Popover
						content={<EmojiPicker onEmojiClick={onEmojiClick} />}
						trigger="hover"
						open={showPicker}
						onOpenChange={setShowPicker}
						placement="topRight"
					>
						<Button icon={<SmileOutlined />} />
					</Popover>
					<Button trigger="hover" type={FormData} icon={<FileAddOutlined />} />

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
