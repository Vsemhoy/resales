import styles from './style/Chat.module.css';
import {useEffect, useMemo, useState} from 'react';
import {useUserData} from '../../../context/UserDataContext.js';
import {useChatRole} from '../../../hooks/sms/useChatRole.js';
import {Badge, Button, Dropdown, Space} from 'antd';
import {MessageOutlined} from '@ant-design/icons';
import {ChatModal} from './ChatModal.jsx';
import useSms from "../../../hooks/sms/useSms";
import {CHAT_LIST_MOCK} from "../mock/mock";
import {useChatSocket} from "../../../context/ChatSocketContext";

const ChatBtn = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { userdata } = useUserData();
	const {
		connected,           // boolean - подключен ли WebSocket
        totalUnread,         // количество непрочитанных сообщений
        chatsList,           // [] - список чатов
        fetchChatsList,
	} = useChatSocket();
	const [currentUserId, setCurrentUserId] = useState(null);
	//const { messages: chats = [], loading, error } = useSms({ search: '', mock: CHAT_LIST_MOCK });

    useEffect(() => {
        fetchChatsList();
    }, []);
    useEffect(() => {
        fetchChatsList();
    }, [totalUnread]);

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
        console.log(chatsList);

		if (!Array.isArray(chatsList) || chatsList.length === 0) {
			return { hasSms: false, messages: [] };
		}

		const messages = chatsList
			.filter((chat) => {
				const fromId = chat.from?.id || chat.from_id;
				const toId = chat.to?.id || chat.to_id;
				return fromId === currentUserId || toId === currentUserId;
			})
            .filter((chat) => chat.count_unread > 0)
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
                    countUnread: chat.count_unread,
					_fullChat: chat,
				};
			});

		return { hasSms: messages.length > 0, messages };
	}, [chatsList, currentUserId, getRole, getDisplayName]);

	// --- Меню для dropdown ---
	const menuItems = useMemo(() => {
		if (!smsData.hasSms) return [];
		const { messages } = smsData;
        return messages.map((message, idx) => {
            return {
                key: `message-${idx}-${message.id}`,
                label: (
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'}}>
                        <div>{message.name}</div>
                        <div>{message.countUnread}</div>
                    </div>
                ),
            }
        });
	}, [smsData]);

	const showModal = () => setIsModalOpen(true);
	const handleOk = () => setIsModalOpen(false);
	const handleCancel = () => setIsModalOpen(false);

	const ButtonNode = (
		<Button style={{ background: 'transparent' }} type="primary" onClick={showModal}>
			<MessageOutlined />
			{totalUnread > 0 && (
				<span className={styles['notification-badge']}>{totalUnread}</span>
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

			<ChatModal open={isModalOpen}
                       onOk={handleOk}
                       onCancel={handleCancel}
                       smsData={smsData}
            />
		</Space>
	);
};
export default ChatBtn;
