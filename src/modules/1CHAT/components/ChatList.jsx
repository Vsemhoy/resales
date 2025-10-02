import { useMemo } from 'react';
import { MOCK } from '../mock/mock';
import { useSms } from '../../../hooks/sms/useSms';
import { FileOutlined } from '@ant-design/icons';
import { useUserData } from '../../../context/UserDataContext';
import styles from './style/Chat.module.css';

export default function ChatList({ search, onSelectChat, selectedChatId }) {
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id;

	const {
		data: smsList = [],
		loading,
		error,
	} = useSms({
		url: '/api/sms',
		mock: MOCK,
	});

	// Функция для определения собеседника
	const getCompanion = useMemo(() => {
		return (sms) => {
			if (!sms || !currentUserId) return null;

			// Если сообщение от текущего пользователя - собеседник это получатель
			if (sms.from?.id === currentUserId) {
				return sms.to;
			}

			// Если сообщение не от текущего пользователя - собеседник это отправитель
			return sms.from;
		};
	}, [currentUserId]);

	// ОТЛАДКА
	console.log('🔍 ChatList Debug:', {
		smsList,
		smsListLength: smsList.length,
		currentUserId,
		selectedChatId,
		search,
		loading,
		error,
	});

	const chats = useMemo(() => {
		const normalizedSearch = search.toLowerCase();

		console.log('🔄 Processing chats, smsList length:', smsList.length);

		const filtered = smsList.filter((sms) => {
			const companion = getCompanion(sms);
			console.log('📞 Companion for sms:', sms.id, companion);

			// Если это сообщение от самого себя (например, в сохраненных)
			if (companion?.id === currentUserId) {
				return true;
			}

			const fullName = `${companion?.surname ?? ''} ${companion?.name ?? ''}`.toLowerCase();
			const messageText = sms.text?.toLowerCase() || '';
			const matchesSearch =
				fullName.includes(normalizedSearch) || messageText.includes(normalizedSearch);

			console.log('🔎 Search check:', { fullName, messageText, normalizedSearch, matchesSearch });
			return matchesSearch;
		});

		console.log('📱 Filtered chats after search:', filtered);

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

		console.log('💬 Final unique chats:', result);

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
	}, [smsList, search, getCompanion, currentUserId]);

	if (loading) return <p className={styles.statusMessage}>Загрузка чатов...</p>;
	if (error) return <p className={styles.statusMessage}>Ошибка: {error}</p>;

	console.log('🎯 Rendering chats:', chats.length);

	return (
		<div className={styles['chat-list__container']}>
			<ul className={styles['chat-list']}>
				{chats.map((chat) => {
					const isSaved = chat.chat_id === 'saved' || chat.isSavedChat;
					const companion = isSaved ? null : getCompanion(chat);

					const lastMessageText = chat.text || (
						<>
							<FileOutlined /> Файл
						</>
					);

					const isActive = chat.chat_id === selectedChatId;

					console.log('💬 Chat item:', {
						chatId: chat.chat_id,
						isSaved,
						companion,
						isActive,
						selectedChatId,
					});

					return (
						<li
							key={chat.chat_id}
							className={`${styles.chatItem} ${isActive ? styles.activeChatItem : ''}`}
							onClick={() => {
								console.log('🖱️ Selecting chat:', chat.chat_id);
								onSelectChat?.(chat.chat_id);
							}}
						>
							<div className={styles.companionName}>
								{isSaved
									? 'Сохранённое'
									: `${companion?.surname ?? ''} ${companion?.name ?? ''}`.trim()}
							</div>
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
