import styles from './style/Chat.module.css';
import { useState, useMemo } from 'react';
import { useUserData } from '../../../context/UserDataContext.js';
import { useChatSocket } from '../../../context/ChatSocketContext.js';

import { Button, Dropdown, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { ChatModal } from './ChatModal.jsx';

export const ChatBtn = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { userdata } = useUserData();
	const { chats /*, connectionStatus */ } = useChatSocket();
	const currentUserId = userdata?.user?.id;

	// --- Формируем smsData (чаты, где участвует текущий пользователь) ---
	const smsData = useMemo(() => {
		if (!Array.isArray(chats) || chats.length === 0) return { hasSms: false, messages: [] };

		const messages = chats
			.filter((chat) => chat.from?.id === currentUserId || chat.to?.id === currentUserId)
			.map((chat) => {
				const companion = chat.from?.id === currentUserId ? chat.to : chat.from;

				return {
					id: chat.chat_id || chat.id,
					name: companion?.name || 'Неизвестный',
					surname: companion?.surname || '',
					content: chat.text || '(без текста)',
					chatId: chat.chat_id,
				};
			});

		return { hasSms: messages.length > 0, messages };
	}, [chats, currentUserId]);

	// --- Меню для dropdown ---
	const menuItems = useMemo(() => {
		if (!smsData.hasSms) return [];

		const { messages } = smsData;
		const count = messages.length;

		const label = (() => {
			if (count === 1) return `${messages[0].name} ${messages[0].surname}`.trim();
			if (count === 2)
				return `${messages[0].name} ${messages[0].surname} и ${messages[1].name} ${messages[1].surname}`.trim();
			return `${messages
				.slice(0, 2)
				.map((m) => `${m.name} ${m.surname}`.trim())
				.join(', ')} и ещё +${count - 2}`;
		})();

		return [
			{
				key: 'sms-section',
				label: (
					<div className={styles['sms-section']}>
						<Space direction="vertical" size={4}>
							<Space size={2} wrap>
								<span className={styles['sms-counter']}>{label}</span>
							</Space>
						</Space>
					</div>
				),
			},
		];
	}, [smsData]);

	const showModal = () => setIsModalOpen(true);
	const handleOk = () => setIsModalOpen(false);
	const handleCancel = () => setIsModalOpen(false);

	const ButtonNode = (
		<Button style={{ background: 'transparent' }} type="primary" onClick={showModal}>
			<MessageOutlined />
			{smsData.hasSms && (
				<span className={styles['notification-badge']}>{smsData.messages.length}</span>
			)}
		</Button>
	);

	return (
		<Space style={{ padding: 0 }}>
			{menuItems.length > 0 ? (
				<Dropdown menu={{ items: menuItems }} trigger={['hover']}>
					<div>{ButtonNode}</div>
				</Dropdown>
			) : (
				<div>{ButtonNode}</div>
			)}

			<ChatModal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} smsData={smsData} />

			{/*
			{connectionStatus === 'disconnected' && (
				<span style={{ color: 'red', fontSize: 12 }}>Нет соединения</span>
			)}
			{connectionStatus === 'mock' && (
				<span style={{ color: 'gray', fontSize: 12 }}>Mock режим</span>
			)}
			*/}
		</Space>
	);
};
