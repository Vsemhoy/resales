import React, { useMemo } from 'react';
import { MOCK } from '../mock/mock';
import { useSms } from '../../../hooks/useSms';

export default function ChatList() {
	const { data, loading, error } = useSms({
		url: '/api/sms', // используется внутри хука при PRODMODE
		mock: MOCK, // используется в dev-режиме
	});

	// Обработка всех сообщений и создание уникальных чатов
	const chats = useMemo(() => {
		if (!data || data.length === 0) return [];

		// Собираем уникальные чаты по chat_id
		const uniqueChatsMap = {};
		data.forEach((sms) => {
			const chatId = sms.chat_id;
			if (!uniqueChatsMap[chatId]) {
				uniqueChatsMap[chatId] = sms;
			} else {
				const existing = uniqueChatsMap[chatId];
				const existingTime = existing.updated_at || existing.created_at;
				const newTime = sms.updated_at || sms.created_at;
				if (newTime > existingTime) {
					uniqueChatsMap[chatId] = sms;
				}
			}
		});

		// Сортировка по дате (сначала самые новые)
		return Object.values(uniqueChatsMap).sort((a, b) => {
			const timeA = new Date(a.updated_at || a.created_at);
			const timeB = new Date(b.updated_at || b.created_at);
			return timeB - timeA;
		});
	}, [data]);

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
