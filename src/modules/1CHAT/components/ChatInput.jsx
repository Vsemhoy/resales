import { useState, useCallback } from 'react';
import { Input, Button, Popover, Space, Upload } from 'antd';
import { SendOutlined, SmileOutlined, FileAddOutlined, UploadOutlined } from '@ant-design/icons';
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

	const handleKeyDown = useCallback((e) => {
		if (e.key === 'Enter' && e.shiftKey) {
			// Shift+Enter - перенос строки
			e.preventDefault();
			const {selectionStart, selectionEnd} = e.target;
			const newValue = inputValue.substring(0, selectionStart) + '\n' + inputValue.substring(selectionEnd);
			setInputValue(newValue);

			// Обновляем позицию курсора после следующего рендера
			setTimeout(() => {
				e.target.selectionStart = e.target.selectionEnd = selectionStart + 1;
			}, 0);
		} else if (e.key === 'Enter' && !e.shiftKey) {
			// Просто Enter - отправка сообщения
			e.preventDefault();
			handleSend();
		}
	}, [inputValue, handleSend]);

	return (
		<Space className={styles.spaceContainer}>
			<Popover
				content={<EmojiPicker onEmojiClick={onEmojiClick}/>}
				trigger="hover"
				open={showPicker}
				onOpenChange={setShowPicker}
				placement="topRight"
			>
				<Button icon={<SmileOutlined/>}/>
			</Popover>

			<Popover
				content={
					<Upload>
						<Button icon={<UploadOutlined/>}>Click to Upload</Button>
					</Upload>
				}
				trigger="hover"
			>
				<Button icon={<FileAddOutlined/>}/>
			</Popover>

			<Input.TextArea
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Введите сообщение..."
				style={{flex: 1}}
				autoSize={{minRows: 1, maxRows: 4}}
			/>

			<Button type="primary" icon={<SendOutlined/>} onClick={handleSend}/>
		</Space>
	);
}