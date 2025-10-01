import { useState, useEffect } from 'react';
import Input from 'antd/es/input/Input';
import styles from './style/Chat.module.css';
import { SearchOutlined } from '@ant-design/icons';

export default function ChatHeader({ onSearchChange }) {
	const [inputValue, setInputValue] = useState('');

	useEffect(() => {
		const timeout = setTimeout(() => {
			onSearchChange(inputValue.trim());
		}, 300);

		return () => clearTimeout(timeout);
	}, [inputValue, onSearchChange]);

	return (
		<header className={styles['chat-header']}>
			<Input
				placeholder="Поиск"
				prefix={<SearchOutlined />}
				className={styles['chat-header__input']}
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
			/>
		</header>
	);
}
