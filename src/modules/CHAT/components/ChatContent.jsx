import styles from './style/Chat.module.css';
// import { PRODMODE } from '../../../config/config';

import {useState, useMemo, useCallback, useEffect} from 'react';
// import { usePolling } from '../../../hooks/sms/usePolling';
import {useUserData} from '../../../context/UserDataContext';
import {useSendSms} from '../../../hooks/sms/useSendSms';
// import { useCompanion } from '../../../hooks/sms/useCompanion';
import {useSms} from '../../../hooks/sms/useSms';

import {Layout, List, message, Button} from 'antd';
import {SyncOutlined} from '@ant-design/icons';
import {nanoid} from 'nanoid';
import {ChatInput} from './ChatInput';
import {MOCK} from '../mock/mock';

// Импортируем новые компоненты сообщений
import ChatSelfMsg from './ChatSelfMsg';
import ChatIncomingMsg from './ChatIncomingMsg';

const {Content, Footer} = Layout;
const generateUUID = () => nanoid(8);

export default function ChatContent({chatId}) {
    const {userdata} = useUserData();
    const currentUserId = userdata?.user?.id;

    // const getRole = useCompanion(currentUserId);

    const {
        data: allSmsList = [],
        loading,
        error,
        refetch,
    } = useSms({
        url: '/api/sms',
        mock: MOCK,
    });

    // Фильтруем сообщения по chat_id вручную
    const smsList = useMemo(() => {
        if (!chatId) return [];

        const filtered = allSmsList.filter((msg) => {
            const msgChatId = parseInt(msg.chat_id);
            const targetChatId = parseInt(chatId);
            return msgChatId === targetChatId;
        });

        return filtered;
    }, [allSmsList, chatId]);

    useEffect(() => {
        // Отладочная логика (закомментирована)
    }, [allSmsList, smsList, currentUserId, chatId, loading, error]);

    const {sendSms} = useSendSms();
    const [localMessages, setLocalMessages] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    const handleManualRefresh = useCallback(() => {
        refetch();
        setLastUpdate(Date.now());
        message.info('Сообщения обновлены');
    }, []);

	const allMessages = useMemo(() => {
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

                // Временная логика определения роли - замените на useCompanion когда будет готов
                const isSelf = msg.from?.id === currentUserId;
                const role = isLocal ? 'self' : isSelf ? 'self' : 'companion';

                let senderName = 'Неизвестный';
                if (role === 'self') {
                    senderName = 'Вы';
                } else {
                    senderName = `${msg.from?.name || ''} ${msg.from?.surname || ''}`.trim() || 'Собеседник';
                }

                return {
                    id: msg.id || generateUUID(),
                    text: msg.text || '',
                    timestamp,
                    time: new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                    role,
                    senderName,
                    isLocal,
                    // Добавляем статус отправки
                    isSending: msg.isSending || false,
                };
            })
            .sort((a, b) => a.timestamp - b.timestamp);
    }, [smsList, localMessages, chatId, allSmsList.length, currentUserId]);

    const handleSend = useCallback(
        async (text) => {
            if (!text.trim()) return;

            const newLocalMsg = {
                id: generateUUID(),
                chat_id: chatId,
                text: text.trim(),
                timestamp: Date.now(),
                from: {id: currentUserId},
                to: {id: chatId},
                isLocal: true,
                isSending: true, // Сообщение отправляется
            };

            // Сразу добавляем сообщение в чат
            setLocalMessages((prev) => [...prev, newLocalMsg]);

            try {
                // Отправляем сообщение
                await sendSms({to: chatId, text: text.trim(), answer: null});

                // После успешной отправки меняем статус
                setLocalMessages((prev) =>
                    prev.map((msg) => (msg.id === newLocalMsg.id ? {...msg, isSending: false} : msg))
                );

                // Сообщение остается в чате с обычным стилем
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
                    {/* <Button
						icon={<SyncOutlined />}
						loading={loading}
						onClick={handleManualRefresh}
						size="small"
					>
						Обновить
					</Button>
					<span className={styles.lastUpdate}>
						Обновлено: {new Date(lastUpdate).toLocaleTimeString()}
					</span> */}
                    <span>*Имя Собеседника*</span>
                </div>

                {loading && allMessages.length === 0 ? (
                    <p className={styles.loading}>Загрузка сообщений...</p>
                ) : allMessages.length === 0 ? (
                    <p className={styles.empty}>Нет сообщений</p>
                ) : (
                    <div className={styles.messagesList}>
                        {allMessages.map(renderMessage)}
                        {/* Тестовые сообщения для отладки стилей */}
                        <ChatIncomingMsg
                            message={{
                                id: 'test-incoming-1',
                                text: 'Тестовое входящее сообщение для проверки стилей',
                                time: '12:00',
                                senderName: 'Тестовый Собеседник',
                            }}
                        />
                    </div>
                )}
            </Content>

            <Footer className={styles['chat-input__footer']}>
                <ChatInput onSend={handleSend}/>
            </Footer>
        </Layout>
    );

}
