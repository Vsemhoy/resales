import { useEffect, useState } from 'react';
import { MOCK } from '../mock/mock';
import { PRODMODE } from '../../../config/config';

export default function ChatList() {
	const [chats, setChats] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			let data;

			if (!PRODMODE) {
				data = MOCK;
			} else {
				try {
					const res = await fetch('/api/sms');
					if (!res.ok) throw new Error('Failed to fetch SMS');
					data = await res.json();
				} catch (err) {
					console.error(err);
					data = [];
				}
			}

			// Берём все SMS
			const allSms = data.flatMap((item) => item.content.sms);

			// Собираем уникальные чаты по chat_id
			const uniqueChatsMap = {};
			allSms.forEach((sms) => {
				const chatId = sms.chat_id;
				if (!uniqueChatsMap[chatId]) {
					uniqueChatsMap[chatId] = sms;
				} else {
					// Обновляем объект, если новое сообщение свежее
					const existing = uniqueChatsMap[chatId];
					const existingTime = existing.updated_at || existing.created_at;
					const newTime = sms.updated_at || sms.created_at;
					if (newTime > existingTime) {
						uniqueChatsMap[chatId] = sms;
					}
				}
			});

			// Преобразуем в массив и сортируем по времени обновления/создания
			const uniqueChats = Object.values(uniqueChatsMap).sort((a, b) => {
				const timeA = a.updated_at || a.created_at;
				const timeB = b.updated_at || b.created_at;
				return timeB - timeA; // самые новые сверху
			});

			setChats(uniqueChats);
		};

		fetchData();
	}, []);

	return (
		<div>
			<ul>
				{chats.map((chat) => (
					<li key={chat.chat_id}>
						{chat.from.surname} {chat.from.name}
						{/* <span>— Chat ID: {chat.chat_id}</span> */}
					</li>
				))}
			</ul>
		</div>
	);
}
