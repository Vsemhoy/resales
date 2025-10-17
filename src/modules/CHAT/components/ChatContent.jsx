import styles from './style/Chat.module.css';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import dayjs from 'dayjs';
import {useUserData} from '../../../context/UserDataContext';
import {Empty, Layout, Spin} from 'antd';
import {ChatInput} from './ChatInput';
import {ChatDivider} from './ChatDivider';
import ChatSelfMsg from './ChatSelfMsg';
import ChatIncomingMsg from './ChatIncomingMsg';
import useSms from '../../../hooks/sms/useSms';
import {useSendSms} from '../../../hooks/sms/useSendSms';
import {CHAT_MOCK} from "../mock/mock";
import {useChatSocket} from "../../../context/ChatSocketContext";

export default function ChatContent({ chatId }) {
	const { userdata } = useUserData();
	const messagesContainerRef = useRef(null);
	const MemoChatSelfMsg = React.memo(ChatSelfMsg);
	const MemoChatIncomingMsg = React.memo(ChatIncomingMsg);
	const MemoChatDivider = React.memo(ChatDivider);
	const [localMessages, setLocalMessages] = useState([]);
	const [currentUserId, setCurrentUserId] = useState(null);
	const { Content, Footer } = Layout;

	const {
		messages,
		who,
		loading
	} = useSms({
		chatId,
		mock: CHAT_MOCK
	});

	const {
		sendSms,
		loadingSendSms,
		errorSendSms,
		successSendSms,
		newId,
		timestamp,
	} = useSendSms();

	const {
		connected,           				  // boolean - подключен ли WebSocket
		connectionStatus,    				  // string - статус подключения
		chats: chatsSocket,  				  // [] - список чатов
		messages: messagesSocket,             // {} - сообщения по chatId
		joinRoom,            				  // function - войти в комнату
		sendMessage,         				  // function - отправить сообщение
		on, off,             				  // function - подписка на события
		updateMessage,       				  // function - обновить сообщение
		replyToMessage,      				  // function - ответить на сообщение
		editMessage,         				  // function - редактировать сообщение
		deleteMessage,       				  // function - удалить сообщение
		updateMessageStatus, 				  // function - обновить статус
	} = useChatSocket();

	const normalizeMessage = useCallback(
		(msg) => {
			return {
				fromId: msg.from_id,
				id: msg.id,
				text: msg.text,
				timestamp: msg.created_at,
				isSelf: msg.from_id === currentUserId,
				senderName: +currentUserId !== +msg.from_id ? who : 'Вы',
				isLocal: msg.isLocal || false,
				isSending: msg.isSending || false,
				_raw: msg,
			};
		},
		[who, currentUserId]
	);

	const allMessages = useMemo(() => {

		const combined = [...messages, ...localMessages];

		const existingIds = new Set();
		const uniqueMessages = combined.filter((msg) => {
			const id = msg.id;
			if (existingIds.has(id?.toString())) {
				return false;
			}
			existingIds.add(id?.toString());
			return true;
		});

		/*console.log('📊 [CHAT] All normalized messages:', normalized);*/
		return uniqueMessages
			.map(normalizeMessage)
			.filter((msg) => msg.text && msg.text.trim() !== '')
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [messages, localMessages, normalizeMessage]);

	const messagesWithDividers = useMemo(() => {
		if (allMessages.length === 0) return [];

		const items = [];
		let lastDayKey = null;

		for (const msg of allMessages) {
			const dayKey = dayjs(+msg.timestamp * 1000).format('DD.MM.YY');
			if (lastDayKey !== dayKey) {
				items.push({ type: 'divider', id: `divider-${dayKey}`, timestamp: msg.timestamp });
				lastDayKey = dayKey;
			}
			items.push({ type: 'msg', id: msg.id, message: msg });
		}
		return items;
	}, [allMessages]);

	useEffect(() => {
		if (!newId || !timestamp) return;

		const localMsgUpd = [...localMessages];
		const localMsgIdx = localMessages.findIndex((msg) => +msg.created_at === +timestamp);

		if (localMsgIdx !== -1) {
			localMsgUpd[localMsgIdx] = {
				...localMsgUpd[localMsgIdx],
				id: newId,
				isSending: false
			};
			setLocalMessages(localMsgUpd);
		}
	}, [newId, timestamp]);
	useEffect(() => {
		setCurrentUserId(userdata?.user?.id);
	}, [userdata]);
	useEffect(() => {
		if (messagesContainerRef.current && allMessages.length > 0) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, [allMessages]);
	useEffect(() => {
		setLocalMessages([]);
	}, [chatId]);

	const handleSend = (trimmed) => {
		const createdAt = Number(dayjs().unix());
		sendSms({ to: chatId, text: trimmed, answer: null, timestamp: createdAt });
		const localMsg = {
			from_id: currentUserId,
			id: createdAt,
			text: trimmed,
			created_at: createdAt,
			updated_at: createdAt,
			answer: null,
			isLocal: true,
			isSending: true,
		};
		setLocalMessages([...localMessages, localMsg]);
	};

	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.chat_content}>
				<div className={styles.chat_header}>
					<span>{!userdata ? 'Загрузка...' : who ? who : 'Неизвестный собеседник'}</span>
					<span>{chatId}</span>
				</div>
					<div className={styles.chat_body} ref={messagesContainerRef}>
						{(messagesWithDividers && messagesWithDividers.length > 0) ? (
								<Spin spinning={loading}>
									<div className={styles.messagesList}
										 style={{flex: 1, overflowY: 'auto', minHeight: 0}}
									>
										{messagesWithDividers.map((item) =>
											item.type === 'divider' ? (
												<MemoChatDivider key={item.id}>
													{dayjs(+item.timestamp * 1000).format('DD.MM.YY')}
												</MemoChatDivider>
											) : +item.message.fromId === +currentUserId ? (
												<MemoChatSelfMsg key={item.message.id} message={item.message}/>
											) : (
												<MemoChatIncomingMsg key={item.message.id} message={item.message}/>
											)
										)}
									</div>
								</Spin>
							) : (
								<Empty description="Еще нет сообщений"
									   image={Empty.PRESENTED_IMAGE_SIMPLE}
									   className={styles.antd_empty}
								/>
							)
						}
					</div>
			</Content>
			<Footer className={styles['chat-input__footer']}>
				<ChatInput onSend={handleSend}/>
			</Footer>
		</Layout>
	);
}
