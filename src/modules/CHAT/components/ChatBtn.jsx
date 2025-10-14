import styles from './style/Chat.module.css';
import { useState, useMemo } from 'react';
import { useUserData } from '../../../context/UserDataContext.js';
import { useChatSocket } from '../../../context/ChatSocketContext.js';
import { useChatRole } from '../../../hooks/sms/useChatRole.js';
import { Button, Dropdown, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { ChatModal } from './ChatModal.jsx';

export const ChatBtn = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { userdata } = useUserData();
	const { chats /*, connectionStatus */ } = useChatSocket();
	const currentUserId = userdata?.user?.id;

	// Используем кастомный хук для логики ролей
	const { getRole, getDisplayName } = useChatRole(currentUserId);

	// --- Формируем smsData (чаты, где участвует текущий пользователь) ---
	const smsData = useMemo(() => {
		if (!Array.isArray(chats) || chats.length === 0) {
			console.log('🔍 [ChatBtn] No chats available');
			return { hasSms: false, messages: [] };
		}

		const messages = chats
			.filter((chat) => {
				const fromId = chat.from?.id || chat.from_id;
				const toId = chat.to?.id || chat.to_id;
				const isParticipant = fromId === currentUserId || toId === currentUserId;

				console.log(
					`🔍 [ChatBtn] Chat ${chat.chat_id}: from=${fromId}, to=${toId}, current=${currentUserId}, isParticipant=${isParticipant}`
				);
				return isParticipant;
			})
			.map((chat) => {
				const role = getRole(chat);
				const displayName = getDisplayName(chat, role, false);

				// Определяем companion на основе роли
				// const companion = role === 'self' ? chat.to : chat.from;

				const result = {
					id: chat.chat_id || chat.id,
					name: displayName || 'Неизвестный',
					surname: '', // Теперь фамилия включена в displayName
					content: chat.text || chat.last_message || '(без текста)',
					chatId: chat.chat_id,
					role: role, // Добавляем роль для отладки
					// ДОБАВЛЕНО: полная структура для отладки
					_fullChat: chat,
				};

				console.log(`🔍 [ChatBtn] Processed chat:`, result);
				return result;
			});

		console.log(`🔍 [ChatBtn] Final messages:`, messages);
		return { hasSms: messages.length > 0, messages };
	}, [chats, currentUserId, getRole, getDisplayName]);

	// --- Меню для dropdown ---
	const menuItems = useMemo(() => {
		console.log('🔍 [ChatBtn] Generating menu items from smsData:', smsData);

		if (!smsData.hasSms) {
			console.log('🔍 [ChatBtn] No messages for menu');
			return [];
		}

		const { messages } = smsData;
		const count = messages.length;

		console.log(`🔍 [ChatBtn] Messages count: ${count}`, messages);

		const label = (() => {
			if (count === 1) return messages[0].name;
			if (count === 2) return `${messages[0].name} и ${messages[1].name}`;
			return `${messages
				.slice(0, 2)
				.map((m) => m.name)
				.join(', ')} и ещё +${count - 2}`;
		})();

		console.log(`🔍 [ChatBtn] Generated label: "${label}"`);

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

	console.log('🔍 [ChatBtn] Rendering with:', {
		menuItemsCount: menuItems.length,
		hasSms: smsData.hasSms,
		messagesCount: smsData.messages.length,
	});

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
		</Space>
	);
};
