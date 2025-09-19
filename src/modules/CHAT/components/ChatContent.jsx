import { useEffect, useState } from 'react';
import { Layout, List, Input, Button, Popover, Space } from 'antd';
import { SendOutlined, SmileOutlined, FileAddOutlined } from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import styles from './style/Chat.module.css';
import { useUserData } from '../../../context/UserDataContext';
import { useSms } from '../../../hooks/sms/useSms';
import { useSendSms } from '../../../hooks/sms/useSendSms';
import { MOCK } from '../mock/mock'; // при необходимости

const { Content, Footer } = Layout;

export default function ChatContent({ chatId }) {
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	const { data: smsList, loading } = useSms({ url: '/api/sms', mock: MOCK });
	const { sendSms, loading: sending } = useSendSms();

	const [text, setText] = useState('');
	const [showPicker, setShowPicker] = useState(false);
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		if (!Array.isArray(smsList) || !chatId) return;

		const filtered = smsList.filter((sms) => sms.chat_id === chatId);

		const normalized = filtered.map((msg) => ({
			id: msg.id,
			from: msg.from.id === currentUserId ? 'me' : 'other',
			text: msg.text,
			time: new Date(msg.updated_at * 1000).toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			}),
			senderName: msg.from.id === currentUserId ? 'Вы' : `${msg.from.name} ${msg.from.surname}`,
		}));

		normalized.sort((a, b) => a.id - b.id);
		setMessages(normalized);
	}, [smsList, currentUserId, chatId]);

	const handleSend = async () => {
		if (!text.trim()) return;

		await sendSms({
			to: chatId, // не нужен, так как бэкенд сам определит по chat_id
			text: text.trim(),
			answer: null,
		});

		setMessages((prev) => [
			...prev,
			{
				id: Date.now(),
				from: 'me',
				text: text.trim(),
				time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			},
		]);

		setText('');
	};

	// Эмоджи
	const onEmojiClick = (emojiData) => {
		setText((prev) => prev + emojiData.emoji);
		setShowPicker(false);
	};

	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.messages}>
				{loading ? (
					<p className={styles.statusMessage}>Загрузка сообщений...</p>
				) : (
					<List
						dataSource={messages}
						renderItem={(msg) => (
							<List.Item
								className={`${styles.message} ${
									msg.from === 'me' ? styles.myMessage : styles.otherMessage
								}`}
							>
								<div
									className={`${styles.bubble} ${
										msg.from === 'me' ? styles.myMessage : styles.otherMessage
									}`}
								>
									<div className={styles.senderName}>{msg.senderName}</div>
									<span>{msg.text}</span>
									<div className={styles.time}>{msg.time}</div>
								</div>
							</List.Item>
						)}
					/>
				)}
			</Content>

			<Footer className={styles['chat-input__footer']}>
				<Space className={styles.spaceContainer}>
					<Button icon={<FileAddOutlined />} disabled />

					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Введите сообщение..."
						style={{ flex: 1 }}
						onPressEnter={handleSend}
					/>

					<Popover
						content={<EmojiPicker onEmojiClick={onEmojiClick} />}
						trigger="click"
						open={showPicker}
						onOpenChange={setShowPicker}
						placement="topRight"
					>
						<Button icon={<SmileOutlined />} />
					</Popover>

					<Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={sending} />
				</Space>
			</Footer>
		</Layout>
	);
}
