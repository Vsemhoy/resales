import React, { useMemo } from 'react';
import { MOCK } from '../mock/mock';
import { useSms } from '../../../hooks/sms/useSms';

export default function ChatList() {
	const {
		data: smsList,
		loading,
		error,
	} = useSms({
		url: '/api/sms',
		mock: MOCK,
	});

	// Обработка всех сообщений и создание уникальных чатов
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

		// Сортировка по времени (самые новые — выше)
		return Object.values(uniqueChatsMap).sort((a, b) => {
			const timeA = a.updated_at || a.created_at;
			const timeB = b.updated_at || b.created_at;
			return timeB - timeA;
		});
	}, [smsList]);

	// Отображение
	if (loading) return <p>Загрузка чатов...</p>;
	if (error) return <p>Ошибка: {error}</p>;

	return (
		<div>
			<ul>
				{chats.map((chat) => (
					<li key={chat.chat_id}>
						{chat.from?.surname} {chat.from?.name}
					</li>
				))}
			</ul>
		</div>
	);
}
