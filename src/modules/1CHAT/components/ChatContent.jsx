import styles from './style/Chat.module.css';
import {useState, useMemo, useCallback, useEffect, useRef} from 'react';
import {useUserData} from '../../../context/UserDataContext';
import {useSendSms} from '../../../hooks/sms/useSendSms';
import {useSms} from '../../../hooks/sms/useSms';

import {Layout, message} from 'antd';
import {nanoid} from 'nanoid';
import {ChatInput} from './ChatInput';
import {MOCK} from '../mock/mock';

// Импортируем новые компоненты сообщений
import ChatSelfMsg from './ChatSelfMsg';
import ChatIncomingMsg from './ChatIncomingMsg';

const {Content, Footer} = Layout;
const generateUUID = () => nanoid(8);

export default function ChatContent({chatId}) {
    const messagesContainerRef = useRef(null);
    const {userdata} = useUserData();
    const currentUserId = userdata?.user?.id;

    // Правильное использование хука useSms
    const {
        data: allSmsList = [],
        who,
        loading,
        error,
    } = useSms({
        chatId,
        mock: MOCK,
    });

    // Фильтруем сообщения по chatId вручную
    const smsList = useMemo(() => {
        if (!chatId || !allSmsList || !Array.isArray(allSmsList)) {
            console.log('❌ Нет данных для фильтрации:', {chatId, allSmsList});
            return [];
        }

        const filtered = allSmsList.filter((msg) => {
            if (!msg) return false;

            const msgChatId = msg.chatId ? parseInt(msg.chatId) : null;
            const targetChatId = parseInt(chatId);

            if (isNaN(msgChatId) || isNaN(targetChatId)) {
                console.log('⚠️ Некорректный chatId:', {msgChatId, targetChatId, msg});
                return false;
            }

            return msgChatId === targetChatId;
        });

        console.log('🎯 Filtered messages for chat', chatId, ':', filtered);
        return filtered;
    }, [allSmsList, chatId]);

    const {sendSms} = useSendSms();
    const [localMessages, setLocalMessages] = useState([]);

    const allMessages = useMemo(() => {
        if (!smsList) return [];

        const filteredLocal = localMessages.filter((msg) => msg.chatId === chatId);
        const combined = [...smsList, ...filteredLocal];

        return combined
            .map((msg) => {
                const isLocal = 'timestamp' in msg && typeof msg.timestamp === 'number';

                let timestamp;
                if (isLocal) {
                    timestamp = msg.timestamp;
                } else {
                    timestamp = (msg.updated_at || msg.created_at) * 1000;
                }

                // Определяем отправителя
                const isSelf = msg.from_id === currentUserId || msg.from?.id === currentUserId;
                const role = isLocal ? 'self' : isSelf ? 'self' : 'companion';

                let senderName = 'Неизвестный';
                if (role === 'self') {
                    senderName = 'Вы';
                } else {
                    senderName = who || 'Неизвестный';
                }

                return {
                    id: msg.id || generateUUID(),
                    text: msg.text || '',
                    timestamp,
                    time: new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                    role,
                    senderName,
                    isLocal,
                    isSending: msg.isSending || false,
                };
            })
            .sort((a, b) => a.timestamp - b.timestamp);
    }, [smsList, localMessages, chatId, currentUserId, who]);

    // Функция для скролла к последнему сообщению
    const scrollToBottom = useCallback(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, []);
    useEffect(() => {
        if (error) {
            console.error('🚨 Ошибка загрузки сообщений:', error);
            message.error('Ошибка загрузки сообщений');
        }
    }, [error]);
    // Автоскролл при загрузке новых сообщений или смене чата
    useEffect(() => {
        if (allMessages.length > 0) {
            scrollToBottom();
        }
    }, [allMessages, scrollToBottom]);

    // Автоскролл при отправке нового сообщения
    useEffect(() => {
        if (localMessages.length > 0) {
            scrollToBottom();
        }
    }, [localMessages, scrollToBottom]);

    useEffect(() => {
        // Отладочная логика
        console.log('🔍 ChatContent Debug:', {
            chatId,
            currentUserId,
            allSmsListLength: allSmsList?.length || 0,
            smsListLength: smsList.length,
            allMessagesLength: allMessages.length,
            loading,
            error,
            who,
        });

        // Логируем структуру сообщений для отладки
        if (allSmsList && allSmsList.length > 0) {
            console.log('📨 Message structure sample:', allSmsList[0]);
        }
        if (smsList && smsList.length > 0) {
            console.log('📨 Filtered message sample:', smsList[0]);
        }
    }, [allSmsList, smsList, allMessages, currentUserId, chatId, loading, error, who]);

    const handleSend = useCallback(
        async (text) => {
            if (!text.trim()) return;

            const newLocalMsg = {
                id: generateUUID(),
                chatId: chatId,
                text: text.trim(),
                timestamp: Date.now(),
                from: {id: currentUserId},
                to: {id: chatId},
                isLocal: true,
                isSending: true,
            };

            // Сразу добавляем сообщение в чат
            setLocalMessages((prev) => [...prev, newLocalMsg]);

            try {
                await sendSms({to: chatId, text: text.trim(), answer: null});

                // После успешной отправки меняем статус
                setLocalMessages((prev) =>
                    prev.map((msg) => (msg.id === newLocalMsg.id ? {...msg, isSending: false} : msg))
                );

            } catch (err) {
                // При ошибке удаляем сообщение
                setLocalMessages((prev) => prev.filter((msg) => msg.id !== newLocalMsg.id));
                message.error(err.message || 'Ошибка при отправке сообщения');
            }
        },
        [chatId, sendSms, currentUserId]
    );

    // Функция для рендеринга сообщений
    const renderMessage = (message) => {
        if (message.role === 'self') {
            return <ChatSelfMsg key={message.id} message={message}/>;
        } else {
            return <ChatIncomingMsg key={message.id} message={message}/>;
        }
    };

    if (error) return <div className={styles.error}>Ошибка загрузки: {error}</div>;

    return (
        <Layout className={styles.chatcontentLayout}>
            <Content className={styles.chatContent}>
                <div className={styles.chatHeader}>
                    <span>
                        {chatId === 'saved'
                            ? 'Сохранённое'
                            : who || 'Загрузка...'
                        }
                    </span>
                </div>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                    {loading && allMessages.length === 0 ? (
                        <p className={styles.loading}>Загрузка сообщений...</p>
                    ) : allMessages.length === 0 ? (
                        <p className={styles.empty}>Нет сообщений</p>
                    ) : (
                        <div
                            ref={messagesContainerRef}
                            className={styles.messagesList}
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                minHeight: 0,
                            }}
                        >
                            {allMessages.map(renderMessage)}
                        </div>
                    )}
                </div>
            </Content>

            <Footer className={styles['chat-input__footer']}>
                <ChatInput onSend={handleSend}/>
            </Footer>
        </Layout>
    );
}