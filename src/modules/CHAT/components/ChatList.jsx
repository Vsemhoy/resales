import React, { useMemo } from 'react';
import { MOCK } from '../mock/mock';
import { useSms } from '../../../hooks/sms/useSms';
import { useCompanion } from '../../../hooks/sms/useCompanion';
import { FileOutlined } from '@ant-design/icons';
import './style/ChatList.css';

export default function ChatList() {
	// 👉 текущий пользователь может быть передан как проп, получен из контекста или auth-хука
	const currentUserId = 46;

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

		const uniqueChatsMap = {};

		smsList.forEach((sms) => {
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
	}, [smsList]);

	if (loading) return <p>Загрузка чатов...</p>;
	if (error) return <p>Ошибка: {error}</p>;

	return (
		<div>
			<ul className="chat-list">
				{chats.map((chat) => {
					const companion = getCompanion(chat);

					const isFile = false; // заглушка
					const lastMessageText = isFile
						? 'document.pdf'
						: chat.text || (
								<>
									<FileOutlined /> Файл
								</>
						  );

					return (
						<li key={chat.chat_id} className="chat-item">
							<div>
								{companion?.surname} {companion?.name}
							</div>
							<div className="last-message">
								{isFile ? `Файл: ${lastMessageText}` : lastMessageText}
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
