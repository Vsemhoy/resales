import { useState, useCallback } from 'react';
import { Input, Button, Popover, Space, Upload, message } from 'antd';
import {
	SendOutlined,
	SmileOutlined,
	FileAddOutlined,
	UploadOutlined,
	PaperClipOutlined,
	DeleteOutlined
} from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import styles from './style/Chat.module.css';
import {TrashIcon} from "@heroicons/react/24/outline";

export function ChatInput({ onSend }) {
	const [inputValue, setInputValue] = useState('');
	const [showPicker, setShowPicker] = useState(false);
	const [fileList, setFileList] = useState([]);

	const handleSend = useCallback(() => {
		const trimmed = inputValue.trim();
		if (!trimmed && fileList.length === 0) return;
		onSend(trimmed, fileList);
		setInputValue('');
		setFileList([]);
	}, [inputValue, fileList, onSend]);

	const onEmojiClick = useCallback((emojiData) => {
		setInputValue((prev) => prev + emojiData.emoji);
		setShowPicker(false);
	}, []);

	const handleKeyDown = useCallback(
		(e) => {
			if (e.key === 'Enter' && e.shiftKey) {
				e.preventDefault();
				const { selectionStart, selectionEnd } = e.target;
				const newValue =
					inputValue.substring(0, selectionStart) + '\n' + inputValue.substring(selectionEnd);
				setInputValue(newValue);

				setTimeout(() => {
					e.target.selectionStart = e.target.selectionEnd = selectionStart + 1;
				}, 0);
			} else if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				handleSend();
			}
		},
		[inputValue, handleSend]
	);

	const handleFileChange = useCallback(({ fileList: newFileList }) => {
		setFileList(newFileList);
	}, []);

	const onRemove = (file) => {
		const index = fileList.indexOf(file);
		const newFileList = fileList.slice();
		newFileList.splice(index, 1);
		setFileList(newFileList);
	};

	const beforeUpload = useCallback((file) => {
		/*const isLt5M = file.size / 1024 / 1024 < 5;
		if (!isLt5M) {
			message.error('Файл должен быть меньше 5MB!');
			return Upload.LIST_IGNORE;
		}*/
		return false;
	}, []);

	return (
		<div className={styles.chat_inputs}>
			<Popover
				content={
					<div style={{ padding: '8px' }}>
						<Upload
							fileList={fileList}
							onChange={handleFileChange}
							beforeUpload={beforeUpload}
							onRemove={onRemove}
							multiple
							showUploadList={true}
						>
							<Button icon={<UploadOutlined />}>Выбрать файлы</Button>
						</Upload>
					</div>
				}
				trigger="click"
				placement="topLeft"
			>
				<Button
					icon={<PaperClipOutlined />}
					variant={fileList.length > 0 ? 'solid' : 'filled'}
					color={'primary'}
					style={fileList.length > 0 ? { backgroundColor: '#1890ff', color: 'white' } : {}}
				/>
			</Popover>

			<Input.TextArea
				className={styles.textArea}
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Введите сообщение..."
				autoSize={{ minRows: 1, maxRows: 6 }}
				style={{ width: '100%' }}
				variant={'borderless'}
			/>

			<Popover
				content={<EmojiPicker onEmojiClick={onEmojiClick} />}
				trigger="hover"
				open={showPicker}
				onOpenChange={setShowPicker}
				placement="topRight"
			>
				<Button icon={<SmileOutlined />} variant={'filled'} color={'primary'} />
			</Popover>

			<Button
				type="primary"
				icon={<SendOutlined />}
				onClick={handleSend}
				disabled={!inputValue.trim() && fileList.length === 0}
			/>
		</div>
	);
}