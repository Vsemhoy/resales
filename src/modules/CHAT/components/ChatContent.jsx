import { useState } from 'react';
import { Layout, List, Input, Button, Popover, Space } from 'antd';
import { SendOutlined, SmileOutlined, FileAddOutlined } from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import './style/ChatContent.css';

const { Content, Footer } = Layout;

const initialMessages = [
	{ id: 1, from: 'me', text: 'Привет 👋', time: '12:00' },
	{ id: 2, from: 'other', text: 'Привет! Как дела?', time: '12:01' },
	{ id: 3, from: 'me', text: 'Всё супер 🚀', time: '12:02' },
	{ id: 1, from: 'me', text: 'Привет 👋', time: '13:05' },
	{ id: 2, from: 'other', text: 'Привет! Как дела?', time: '13:06' },
	{ id: 3, from: 'me', text: 'Всё супер 🚀', time: '14:02' },
	{ id: 1, from: 'me', text: 'Привет 👋', time: '15:00' },
	{ id: 2, from: 'other', text: 'Привет! Как дела?', time: '16:11' },
	{ id: 3, from: 'me', text: 'Всё супер 🚀', time: '17:42' },
];

export default function ChatContent() {
	const [messages, setMessages] = useState(initialMessages);
	const [text, setText] = useState('');
	const [showPicker, setShowPicker] = useState(false);

	const onEmojiClick = (emojiData) => {
		setText((prev) => prev + emojiData.emoji);
		setShowPicker(false);
	};

	const sendMessage = () => {
		if (!text.trim()) return;
		setMessages((prev) => [
			...prev,
			{
				id: prev.length + 1,
				from: 'me',
				text: text.trim(),
				time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			},
		]);
		setText('');
	};

	return (
		<Layout className="chatcontent-layout">
			<Content className="messages">
				<List
					dataSource={messages}
					renderItem={(msg) => (
						<List.Item className={`message ${msg.from === 'me' ? 'my-message' : 'other-message'}`}>
							<div className="bubble">
								<span>{msg.text}</span>
								<div className="time">{msg.time}</div>
							</div>
						</List.Item>
					)}
				/>
			</Content>

			<Footer className="chat-input-footer">
				<Space style={{ width: '100%', alignItems: 'space-between' }}>
					<Button icon={<FileAddOutlined />} onClick={sendMessage} />

					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Введите сообщение..."
						style={{ flex: 1 }}
						onPressEnter={sendMessage}
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
					<Button type="primary" icon={<SendOutlined />} onClick={sendMessage} />
				</Space>
			</Footer>
		</Layout>
	);
}
