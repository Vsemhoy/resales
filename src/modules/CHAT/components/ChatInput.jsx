import { useState, useCallback } from 'react';
import { Input, Button, Popover, Space } from 'antd';
import { SendOutlined, SmileOutlined, FileAddOutlined } from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import styles from './style/Chat.module.css';

export function ChatInput({ onSend }) {
	const [inputValue, setInputValue] = useState('');
	const [showPicker, setShowPicker] = useState(false);

	const handleSend = useCallback(() => {
		const trimmed = inputValue.trim();
		if (!trimmed) return;

		onSend(trimmed);
		setInputValue('');
	}, [inputValue, onSend]);

	const onEmojiClick = useCallback((emojiData) => {
		setInputValue((prev) => prev + emojiData.emoji);
		setShowPicker(false);
	}, []);

	return (
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
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				placeholder="Введите сообщение..."
				style={{ flex: 1 }}
				onPressEnter={handleSend}
			/>

			<Button type="primary" icon={<SendOutlined />} onClick={handleSend} />
		</Space>
	);
}
