import { useMemo } from 'react';
import { MOCK } from '../mock/mock';
import { useSms } from '../../../hooks/sms/useSms';
import { FileOutlined } from '@ant-design/icons';
import { useUserData } from '../../../context/UserDataContext';
import styles from './style/Chat.module.css';
import { useCompanion } from '../../../hooks/sms/useCompanion';

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

	const getCompanion = useCompanion(currentUserId);

	const chats = useMemo(() => {
		const normalizedSearch = search.toLowerCase();

		const filtered = smsList.filter((sms) => {
			const companion = getCompanion(sms);
			if (companion === 'self') return true;

			const fullName = `${companion?.surname ?? ''} ${companion?.name ?? ''}`.toLowerCase();
			const messageText = sms.text?.toLowerCase() || '';
			return fullName.includes(normalizedSearch) || messageText.includes(normalizedSearch);
		});

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

		// Чат "Сохранённое"
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

					return (
						<li
							key={chat.chat_id}
							className={`${styles.chatItem} ${isActive ? styles.activeChatItem : ''}`}
							onClick={() => onSelectChat?.(chat.chat_id)}
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
