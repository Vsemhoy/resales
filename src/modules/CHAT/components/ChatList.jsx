import { useMemo } from 'react';
import { MOCK } from '../mock/mock';
import { useSms } from '../../../hooks/sms/useSms';
import { useCompanion } from '../../../hooks/sms/useCompanion';
import { FileOutlined } from '@ant-design/icons';
import { useUserData } from '../../../context/UserDataContext';
import styles from './style/Chat.module.css';

export default function ChatList({ search, onSelectChat }) {
	const { userdata } = useUserData();
	const currentUserId = userdata?.user?.id || NaN;

	const {
		data: smsList,
		loading,
		error,
	} = useSms({
		url: '/api/sms',
		mock: MOCK,
	});

	const getCompanion = useCompanion(currentUserId);

	const chats = useMemo(() => {
		if (!Array.isArray(smsList) || smsList.length === 0) return [];

		// 🔍 фильтрация
		const normalizedSearch = search.toLowerCase();

		const filtered = smsList.filter((sms) => {
			const companion = getCompanion(sms);

			const fullName = `${companion?.surname ?? ''} ${companion?.name ?? ''}`.toLowerCase();
			const messageText = sms.text?.toLowerCase() || '';

			return fullName.includes(normalizedSearch) || messageText.includes(normalizedSearch);
		});
		// 🧠 последние сообщения по chat_id
		const uniqueChatsMap = {};
		filtered.forEach((sms) => {
			const chatId = sms.chat_id;
			const currentTime = sms.updated_at || sms.created_at;

			if (!uniqueChatsMap[chatId]) {
				uniqueChatsMap[chatId] = sms;
			} else {
				const existingTime = uniqueChatsMap[chatId].updated_at || uniqueChatsMap[chatId].created_at;
				if (currentTime > existingTime) {
					uniqueChatsMap[chatId] = sms;
				}
			}
		});

		return Object.values(uniqueChatsMap).sort((a, b) => {
			const timeA = a.updated_at || a.created_at;
			const timeB = b.updated_at || b.created_at;
			return timeB - timeA;
		});
	}, [smsList, search, getCompanion]);

	if (loading) return <p className={styles.statusMessage}>Загрузка чатов...</p>;
	if (error) return <p className={styles.statusMessage}>Ошибка: {error}</p>;

	return (
		<div className={styles['chat-list__container']}>
			<ul className={styles['chat-list']}>
				{chats.map((chat) => {
					const companion = getCompanion(chat);
					const isFile = false;

					const lastMessageText = isFile
						? 'document.pdf'
						: chat.text || (
								<>
									<FileOutlined /> Файл
								</>
						  );

					return (
						<li
							key={chat.chat_id}
							className={styles.chatItem}
							onClick={() => onSelectChat?.(chat.chat_id)} // ✅
						>
							<div className={styles.companionName}>
								{companion?.surname} {companion?.name}
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
