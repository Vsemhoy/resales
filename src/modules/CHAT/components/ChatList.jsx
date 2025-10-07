import { useMemo } from 'react';
import { MOCK } from '../mock/mock';
import { useSms } from '../../../hooks/sms/useSms';
import { FileOutlined } from '@ant-design/icons';
import { useUserData } from '../../../context/UserDataContext';
import styles from './style/Chat.module.css';
// import { PRODMODE } from '../../../config/config';

export default function ChatList({ search, onSelectChat, selectedChatId }) {
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	const {
		data: smsList = [],
		loading,
		error,
	} = useSms({
		// url: '/api/sms',
		chatId: 0,
		mock: MOCK,
		search,
	});

	// Функция для определения роли сообщения
	const getRole = useMemo(() => {
		return (sms) => {
			if (!sms || !currentUserId) return null;

			// Если сообщение от текущего пользователя - роль 'self'
			if (sms.from?.id === currentUserId) {
				return 'self';
			}

			// Если сообщение не от текущего пользователя - роль 'companion'
			return 'companion';
		};
	}, [currentUserId]);

	const chats = useMemo(() => {
		const normalizedSearch = search.toLowerCase();

		console.log('🔄 Processing chats, smsList length:', smsList.length);

		const filtered = smsList.filter((sms) => {
			const role = getRole(sms);
			console.log('📞 Role for sms:', sms.id, role);

			// Если это сообщение в сохраненных (от себя себе)
			if (sms.to?.id === currentUserId && sms.from?.id === currentUserId) {
				return true;
			}

			// Определяем пользователя для поиска в зависимости от роли
			const searchUser = role === 'self' ? sms.to : sms.from;

			const fullName = `${searchUser?.surname ?? ''} ${searchUser?.name ?? ''}`.toLowerCase();
			const messageText = sms.text?.toLowerCase() || '';
			const matchesSearch =
				fullName.includes(normalizedSearch) || messageText.includes(normalizedSearch);

			console.log('🔎 Search check:', { fullName, messageText, normalizedSearch, matchesSearch });

			return matchesSearch;
		});

		console.log('📱 Filtered chats after search:', filtered.length);

		const uniqueChatsMap = {};
		filtered.forEach((sms) => {
			const chatId = sms.chat_id;
			const currentTime = sms.updated_at || sms.created_at;

			if (
				!uniqueChatsMap[chatId] ||
				currentTime > (uniqueChatsMap[chatId].updated_at || uniqueChatsMap[chatId].created_at)
			) {
				uniqueChatsMap[chatId] = sms;
			}
		});

		const result = Object.values(uniqueChatsMap).sort((a, b) => {
			const timeA = a.updated_at || a.created_at;
			const timeB = b.updated_at || b.created_at;
			return timeB - timeA;
		});

		console.log('💬 Final unique chats:', result.length);

		// Добавляем чат "Сохранённое" с ролью 'self'
		result.unshift({
			chat_id: 'saved',
			from: { id: currentUserId, name: 'Вы', surname: '' },
			to: { id: currentUserId, name: 'Вы', surname: '' },
			text: '📁',
			updated_at: Infinity,
			created_at: Infinity,
			isSavedChat: true,
		});

		return result;
	}, [smsList, search, currentUserId, getRole]);

	if (loading) return <p className={styles.statusMessage}>Загрузка чатов...</p>;
	if (error) return <p className={styles.statusMessage}>Ошибка: {error}</p>;

	console.log('🎯 Rendering chats:', chats.length);

	return (
		<div className={styles['chat-list__container']}>
			<ul className={styles['chat-list']}>
				{chats.map((chat) => {
					const isSaved = chat.chat_id === 'saved' || chat.isSavedChat;
					const role = isSaved ? 'self' : getRole(chat);

					// Определяем отображаемое имя в зависимости от роли
					let displayName = '';
					if (isSaved) {
						displayName = 'Сохранённое';
					} else if (role === 'self') {
						// Для своих сообщений показываем имя получателя
						displayName = `${chat.to?.surname ?? ''} ${chat.to?.name ?? ''}`.trim();
					} else {
						// Для входящих сообщений показываем имя отправителя
						displayName = `${chat.from?.surname ?? ''} ${chat.from?.name ?? ''}`.trim();
					}

					const lastMessageText = chat.text || (
						<>
							<FileOutlined /> Файл
						</>
					);

					const isActive = chat.chat_id === selectedChatId;

					return (
						<li
							key={chat.chat_id}
							className={`${styles.chatItem} ${isActive ? styles.activeChatItem : ''}`}
							onClick={() => {
								console.log('🖱️ Selecting chat:', chat.chat_id);
								onSelectChat?.(chat.chat_id);
							}}
						>
							<div className={styles.companionName}>{displayName || 'Неизвестный'}</div>
							<div className={styles.lastMessage}>
								{typeof lastMessageText === 'string'
									? lastMessageText.length > 20
										? `${lastMessageText.slice(0, 20)} ...`
										: lastMessageText
									: lastMessageText}
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
