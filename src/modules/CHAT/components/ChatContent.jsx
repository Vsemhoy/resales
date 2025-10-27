import styles from './style/Chat.module.css';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import dayjs from 'dayjs';
import {useUserData} from '../../../context/UserDataContext';
import {Empty, Layout, Spin} from 'antd';
import {ChatInput} from './ChatInput';
import {ChatDivider} from './ChatDivider';
import ChatSelfMsg from './ChatSelfMsg';
import ChatIncomingMsg from './ChatIncomingMsg';
import {useSendSms} from '../../../hooks/sms/useSendSms';
import {useChatSocket} from "../../../context/ChatSocketContext";
import { useMarkMessagesRead } from '../../../hooks/sms/useMarkMessagesRead';
import {useInfiniteScrollUp} from "../../../hooks/sms/useInfiniteScrollUp";
import {logDOM} from "@testing-library/dom";
import {LoadingOutlined} from "@ant-design/icons";

export default function ChatContent({ chatId }) {
	const { userdata } = useUserData();
	const messagesContainerRef = useRef(null);
	const MemoChatSelfMsg = React.memo(ChatSelfMsg);
	const MemoChatIncomingMsg = React.memo(ChatIncomingMsg);
	const MemoChatDivider = React.memo(ChatDivider);
	const [currentUserId, setCurrentUserId] = useState(null);
	const { Content, Footer } = Layout;
	const [chat, setChat] = useState({
		chat_id: 0,
		who: '',
		messages: [],
	});
    const [hasMore, setHasMore] = useState(true);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

	const normalizeMessage = useCallback((msg) => {
			return {
				fromId: msg.from_id,
				id: msg.id,
				text: msg.text,
				files: msg.files,
				timestamp: msg.created_at,
				isSelf: msg.from_id === currentUserId,
				senderName: +currentUserId !== +msg.from_id ? chat.who : 'Вы',
				isLocal: msg.isLocal || false,
				isSending: msg.isSending || false,
				status: msg.status || false,
				_raw: msg,
			};
		}, [chat.who, currentUserId]);
	const allMessages = useMemo(() => {
		const combined = [...chat.messages];
		const existingIds = new Set();
		const uniqueMessages = combined.filter((msg) => {
			const id = msg.id;
			if (existingIds.has(id?.toString())) {
				return false;
			}
			existingIds.add(id?.toString());
			return true;
		});
		return uniqueMessages.map(normalizeMessage);
	}, [chat, normalizeMessage]);
    const messagesWithDividers = useMemo(() => {
        if (!allMessages || allMessages.length === 0) return [];
        const isDesc = allMessages.length > 1 && Number(allMessages[0].timestamp) > Number(allMessages[allMessages.length - 1].timestamp);
        const sorted = isDesc ? [...allMessages].slice().reverse() : [...allMessages];
        const items = [];
        let lastDayKey = null;
        for (const msg of sorted) {
            const dayKey = dayjs(Number(msg.timestamp) * 1000).format('DD.MM.YY');
            if (lastDayKey !== dayKey) {
                items.push({ type: 'divider', id: `divider-${dayKey}`, timestamp: msg.timestamp });
                lastDayKey = dayKey;
            }
            items.push({ type: 'msg', id: msg.id, message: msg });
        }
        return isDesc ? items.slice().reverse() : items;
    }, [allMessages]);

	const {
		/* socket */
		on, off,            // function - подписка на события
		connected,          // boolean - подключен ли WebSocket
		connectionStatus,   // string - статус подключения
		/* info */
		chats,  			// [] - список чатов
		loadingChat,		// загрузка сообщений
		loadingSendSms,		// ожидание ответа от сервера при отправке сообщения
		/* methods */
		fetchChatMessages,	// подгрузить чат с сообщениями
		sendSms,			// отправить сообщение
		markMessagesAsRead,
	} = useChatSocket();

	const { processedMessages } = useMarkMessagesRead(
		messagesWithDividers,
		currentUserId,
		chatId,
		markMessagesAsRead
	);

    useInfiniteScrollUp({
        containerRef: messagesContainerRef,
        fetchMoreMessages: () => fetchChatMessages(chatId, chat.messages[0].id),
        hasMore,
        offset: 500,
    });

	useEffect(() => {
		const foundedChat = chats.find(chat => chat.chat_id === chatId || chat.id === chatId);
		if (!foundedChat && chatId&& !loadingChat && !loadingSendSms) {
			console.log('Fetching chat messages for:', chatId);
            messagesWithDividers.length = 0;
			fetchChatMessages(chatId);
		} else if (foundedChat) {
			console.log('Chat found:', foundedChat);
			setChat(foundedChat);
		}
	}, [chats, chatId, loadingChat, loadingSendSms]);
	useEffect(() => {
		setCurrentUserId(userdata?.user?.id);
	}, [userdata]);
	useEffect(() => {
		if (messagesContainerRef.current && allMessages.length > 0 && !isScrolledToBottom) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            setIsScrolledToBottom(true);
		}
	}, [allMessages]);
    useEffect(() => {
        setIsScrolledToBottom(false);
    }, [chatId]);
    useEffect(() => {
        setHasMore( (chat?.total - chat?.messages?.length) > 0);
    }, [chat]);

	const handleSend = (trimmed, fileList) => {
		sendSms({
			to: chatId,
			text: trimmed,
			files: fileList,
			answer: null,
			timestamp: Number(dayjs().unix()),
			from_id: currentUserId
		});
	};

	return (
		<Layout className={styles.chatcontentLayout}>
			<Content className={styles.chat_content}>
				<div className={styles.chat_header}>
					<span>{!userdata ? 'Загрузка...' : chat.who ? chat.who : 'Неизвестный собеседник'}</span>
                    {loadingChat ? (<LoadingOutlined />) : (<span>{chatId}</span>)}
				</div>
                <div className={styles.chat_body} ref={messagesContainerRef}>
                    {(messagesWithDividers && messagesWithDividers.length > 0) ? messagesWithDividers.map((item) =>
                                item.type === 'divider' ? (
                                    <MemoChatDivider key={item.id}>
                                        {dayjs(+item.timestamp * 1000).format('DD.MM.YY')}
                                    </MemoChatDivider>
                                ) : +item.message.fromId === +currentUserId ? (
                                    <MemoChatSelfMsg key={item.message.id}
                                                     message={item.message}
                                    />
                                ) : (
                                    <MemoChatIncomingMsg key={item.message.id}
                                                         message={item.message}
                                                         data-message-id={item.message.id}
                                    />
                                )

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
