import {useEffect, useMemo} from 'react';
import {FileOutlined} from '@ant-design/icons';
import {useUserData} from '../../../context/UserDataContext';
import {useChatRole} from '../../../hooks/sms/useChatRole';
import styles from './style/Chat.module.css';
import dayjs from 'dayjs';
import {useChatSocket} from "../../../context/ChatSocketContext";

export default function ChatList({ search, onSelectChat, selectedChatId }) {
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	const {
		/* socket */
		on, off,            // function - подписка на события
		connected,          // boolean - подключен ли WebSocket
		connectionStatus,   // string - статус подключения
		/* info */
		chatsList,
		loadingChatList,
		/* methods */
		fetchChatsList
	} = useChatSocket();

	useEffect(() => {
		fetchChatsList(search);
	}, [search]);

	const { getRole, getDisplayName } = useChatRole(currentUserId);

	const chats = useMemo(() => {
		const normalizedSearch = search.toLowerCase();

		const filtered = chatsList.filter((sms) => {
			// Сообщения себе всегда показываем
			if (sms.to?.id === currentUserId && sms.from?.id === currentUserId) {
				return true;
			}

			const role = getRole(sms);
			const displayName = getDisplayName(sms, role, false);
			const messageText = sms.text?.toLowerCase() || '';

			return displayName.toLowerCase().includes(normalizedSearch) ||
				messageText.includes(normalizedSearch);
		});

		// Группировка по chat_id с выбором последнего сообщения
		const uniqueChatsMap = filtered.reduce((acc, sms) => {
			const chatId = sms.chat_id;
			const currentTime = sms.updated_at || sms.created_at;
			const existing = acc[chatId];

			if (!existing || currentTime > (existing.updated_at || existing.created_at)) {
				acc[chatId] = sms;
			}

			return acc;
		}, {});

		const result = Object.values(uniqueChatsMap).sort((a, b) => {
			const timeA = a.updated_at || a.created_at;
			const timeB = b.updated_at || b.created_at;
			return timeB - timeA;
		});

		// Добавляем чат "Сохранённое"
		result.unshift({
			chat_id: currentUserId,
			from: { id: currentUserId, name: 'Вы', surname: '' },
			to: { id: currentUserId, name: 'Вы', surname: '' },
			text: '📁',
			updated_at: Infinity,
			created_at: Infinity,
			isSavedChat: true,
		});

		return result;
	}, [chatsList, search, currentUserId, getRole, getDisplayName]);

	return (
		<div className={styles['chat-list__container']}>
			<ul className={styles['chat-list']}>
				{chats.map((chat) => {
					const isSaved = chat.chat_id === 'saved' || chat.isSavedChat;
					const role = isSaved ? 'self' : getRole(chat);
					const displayName = getDisplayName(chat, role, isSaved);
					const isActive = chat.chat_id === selectedChatId;

					const lastMessageText = chat.text || (
						<>
							<FileOutlined /> Файл
						</>
					);

					const truncatedText =
						typeof lastMessageText === 'string'
							? lastMessageText.length > 20
								? `${lastMessageText.slice(0, 20)} ...`
								: lastMessageText
							: lastMessageText;

					return (
						<>
							{/* {DEBUGGER} */}
							<li
								key={chat.chat_id}
								className={`${styles.chatItem} ${isActive ? styles.activeChatItem : ''}`}
								onClick={() => {
									onSelectChat?.(chat.chat_id);
								}}
							>
								<div className={styles.companionName}>{displayName || 'Неизвестный'}</div>
								<div className={styles.lastMessage}>{truncatedText}</div>
							</li>
						</>
					);
				})}
			</ul>
		</div>
	);
}
