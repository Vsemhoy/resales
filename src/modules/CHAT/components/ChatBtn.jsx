import styles from './style/Chat.module.css';
import {useEffect, useMemo, useState} from 'react';
import {useUserData} from '../../../context/UserDataContext.js';
import {useChatRole} from '../../../hooks/sms/useChatRole.js';
import {Button, Dropdown, Space} from 'antd';
import {MessageOutlined} from '@ant-design/icons';
import {ChatModal} from './ChatModal.jsx';
import useSms from "../../../hooks/sms/useSms";
import {CHAT_LIST_MOCK} from "../mock/mock";
import {useChatSocket} from "../../../context/ChatSocketContext";

export const ChatBtn = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { userdata } = useUserData();
	const {
		connected,           // boolean - подключен ли WebSocket
		connectionStatus,    // string - статус подключения
		chats: chatsSocket,  // [] - список чатов
		messages,            // {} - сообщения по chatId
		joinRoom,            // function - войти в комнату
		sendMessage,         // function - отправить сообщение
		on, off,             // function - подписка на события
		updateMessage,       // function - обновить сообщение
		replyToMessage,      // function - ответить на сообщение
		editMessage,         // function - редактировать сообщение
		deleteMessage,       // function - удалить сообщение
		updateMessageStatus, // function - обновить статус
	} = useChatSocket();
	const [currentUserId, setCurrentUserId] = useState(null);
	const { messages: chats = [], loading, error } = useSms({ search: '', mock: CHAT_LIST_MOCK });

	useEffect(() => {
		if (userdata?.user?.id) {
			setCurrentUserId(userdata?.user?.id);
		} else {
			setCurrentUserId(null);
		}
	}, [userdata]);

	// Используем кастомный хук для логики ролей
	const { getRole, getDisplayName } = useChatRole(currentUserId);

	// --- Формируем smsData (чаты, где участвует текущий пользователь) ---
	const smsData = useMemo(() => {
		if (!Array.isArray(chats) || chats.length === 0) {
			return { hasSms: false, messages: [] };
		}

		const messages = chats
			.filter((chat) => {
				const fromId = chat.from?.id || chat.from_id;
				const toId = chat.to?.id || chat.to_id;
				return fromId === currentUserId || toId === currentUserId;
			})
			.map((chat) => {
				const role = getRole(chat);
				const displayName = getDisplayName(chat, role, false);

				// Определяем companion на основе роли
				// const companion = role === 'self' ? chat.to : chat.from;

				return {
					id: chat.chat_id || chat.id,
					name: displayName || 'Неизвестный',
					surname: '', // Теперь фамилия включена в displayName
					content: chat.text || chat.last_message || '(без текста)',
					chatId: chat.chat_id,
					role: role, // Добавляем роль для отладки
					_fullChat: chat,
				};
			});

		return { hasSms: messages.length > 0, messages };
	}, [chats, currentUserId, getRole, getDisplayName]);

	// --- Меню для dropdown ---
	const menuItems = useMemo(() => {
		if (!smsData.hasSms) {
			return [];
		}

		const { messages } = smsData;
		const count = messages.length;

		const label = (() => {
			if (count === 1) return messages[0].name;
			if (count === 2) return `${messages[0].name} и ${messages[1].name}`;
			return `${messages
				.slice(0, 2)
				.map((m) => m.name)
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

			<ChatModal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} smsData={smsData}/>
		</Space>
	);
};
