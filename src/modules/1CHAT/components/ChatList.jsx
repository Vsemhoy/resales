import { useMemo, useState, useEffect, useCallback } from 'react';
import { FileOutlined } from '@ant-design/icons';
import { useUserData } from '../../../context/UserDataContext';
import { useChatSocket } from '../../../context/ChatSocketContext';
import { MOCK } from '../mock/mock';
import styles from './style/Chat.module.css';
import React from 'react';

// --- Меморизируем отдельный элемент чата ---
const ChatListItem = React.memo(({ chat, isActive, onSelectChat, getCompanion }) => {
	const isSaved = chat.isSavedChat || chat.chat_id === 'saved';
	const companion = isSaved ? null : getCompanion(chat);
	const lastMessageText =
		chat.text ||
		(chat.files?.length > 0 ? (
			<>
				<FileOutlined /> Файл
			</>
		) : (
			''
		));

	return (
		<li
			key={chat.chat_id}
			className={`${styles.chatItem} ${isActive ? styles.activeChatItem : ''}`}
			onClick={() => onSelectChat?.(chat.chat_id)}
		>
			<div className={styles.companionName}>
				{isSaved ? 'Сохранённое' : `${companion?.surname ?? ''} ${companion?.name ?? ''}`.trim()}
			</div>
			<div className={styles.lastMessage}>
				{typeof lastMessageText === 'string'
					? lastMessageText.length > 30
						? `${lastMessageText.slice(0, 30)} ...`
						: lastMessageText
					: lastMessageText}
			</div>
		</li>
	);
});

export default function ChatList({ search, onSelectChat, selectedChatId }) {
	const { userdata } = useUserData();
	const { chats, connectionStatus, socket, localMessages } = useChatSocket();
	const currentUserId = userdata?.user?.id;

	const [smsList, setSmsList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// --- Получаем собеседника ---
	const getCompanion = useMemo(
		() => (sms) => {
			if (!sms || !currentUserId) return null;
			return sms.from?.id === currentUserId ? sms.to : sms.from;
		},
		[currentUserId]
	);

	// --- Обновление smsList при новых данных ---
	const updateSmsList = useCallback(
		(newSms) => {
			setSmsList((prev) => {
				const existingIndex = prev.findIndex((sms) => sms.id === newSms.id);
				if (existingIndex >= 0) {
					const copy = [...prev];
					copy[existingIndex] = newSms; // обновляем
					return copy;
				} else {
					return [...prev, newSms]; // добавляем новое
				}
			});
		},
		[setSmsList]
	);

	// --- Инициализация списка сообщений ---
	useEffect(() => {
		setLoading(true);
		setError(null);

		try {
			if (connectionStatus === 'connected' && Array.isArray(chats) && chats.length > 0) {
				setSmsList(chats);
			} else {
				const sms = MOCK?.content?.sms || [];
				setSmsList(Array.isArray(sms) ? sms : []);
			}
		} catch (err) {
			setError('Ошибка загрузки данных');
			setSmsList([]);
		} finally {
			setLoading(false);
		}
	}, [chats, connectionStatus]);

	// --- Подписка на новые сообщения через socket.io ---
	useEffect(() => {
		if (connectionStatus === 'connected' && socket) {
			const handleNewMessage = (msg) => updateSmsList(msg);
			socket.on('message:new', handleNewMessage);
			return () => socket.off('message:new', handleNewMessage);
		}
	}, [socket, connectionStatus, updateSmsList]);

	// --- Моковые новые сообщения при PRODMODE === false ---
	useEffect(() => {
		if (connectionStatus !== 'mock') return;

		const interval = setInterval(() => {
			const newMsgId = Date.now();
			const newSms = {
				id: newMsgId,
				chat_id: 540,
				from: { id: 540, name: 'Анатолий', surname: 'Дроботенко' },
				to: { id: 46, name: 'Александр', surname: 'Кошелев' },
				text: `Тестовое сообщение #${newMsgId}`,
				created_at: Math.floor(Date.now() / 100),
				updated_at: Math.floor(Date.now() / 100),
				files: [],
			};
			updateSmsList(newSms);
		}, 12000);

		return () => clearInterval(interval);
	}, [connectionStatus, updateSmsList]);

	// --- Объединяем серверные и локальные сообщения для отображения ---
	const mergedSmsList = useMemo(() => {
		const local = Array.isArray(localMessages) ? localMessages : [];
		const existingIds = new Set(smsList.map((m) => m.id));
		const newLocal = local.filter((m) => !existingIds.has(m.id));
		return [...smsList, ...newLocal];
	}, [smsList, localMessages]);

	// --- Формируем список чатов с последним сообщением ---
	const chatList = useMemo(() => {
		if (!mergedSmsList || mergedSmsList.length === 0) return [];

		const normalizedSearch = search?.toLowerCase() || '';
		const chatsMap = new Map();

		mergedSmsList.forEach((sms) => {
			const chatId = sms.chat_id;
			const currentTime = sms.updated_at || sms.created_at;
			const existing = chatsMap.get(chatId);
			if (!existing || currentTime > (existing.updated_at || existing.created_at)) {
				chatsMap.set(chatId, sms);
			}
		});

		let result = [...chatsMap.values()];

		// Фильтруем по поиску
		result = result.filter((sms) => {
			const companion = getCompanion(sms);
			const fullName = `${companion?.surname ?? ''} ${companion?.name ?? ''}`.toLowerCase();
			const messageText = sms.text?.toLowerCase() || '';
			return fullName.includes(normalizedSearch) || messageText.includes(normalizedSearch);
		});

		// Сортируем по последнему сообщению
		result.sort((a, b) => {
			const timeA = a.updated_at || a.created_at;
			const timeB = b.updated_at || b.created_at;
			return timeB - timeA;
		});

		// Добавляем "Сохранённое"
		result.unshift({
			chat_id: 'saved',
			from: { id: currentUserId, name: 'Вы', surname: '' },
			to: { id: currentUserId, name: 'Вы', surname: '' },
			text: '📁',
			isSavedChat: true,
			updated_at: Infinity,
			created_at: Infinity,
		});

		return result;
	}, [mergedSmsList, search, currentUserId, getCompanion]);

	if (loading) return <p className={styles.statusMessage}>Загрузка чатов...</p>;
	if (error) return <p className={styles.statusMessage}>Ошибка: {error}</p>;

	return (
		<div className={styles['chat-list__container']}>
			<ul className={styles['chat-list']}>
				{chatList.map((chat) => (
					<ChatListItem
						key={chat.chat_id}
						chat={chat}
						isActive={chat.chat_id === selectedChatId}
						onSelectChat={onSelectChat}
						getCompanion={getCompanion}
					/>
				))}
			</ul>
		</div>
	);
}
