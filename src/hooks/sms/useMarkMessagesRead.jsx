import { useEffect, useRef, useState } from 'react';

export const useMarkMessagesRead = (messages, currentUserId, chatId, markMessagesAsRead) => {
    const observerRef = useRef();
    const [processedMessages, setProcessedMessages] = useState(new Set());

    useEffect(() => {
        if (!messages.length || !markMessagesAsRead) return;

        // Находим непрочитанные входящие сообщения
        const unreadMessages = messages
            .filter(item => item.type !== 'divider')
            .filter(item => +item.message.fromId !== +currentUserId)
            .filter(item => item.message.status === 'unread' || item.message.status === 'sent')
            .map(item => ({
                id: item.message.id,
                element: document.querySelector(`[data-message-id="${item.message.id}"]`)
            }))
            .filter(item => item.element);

        if (unreadMessages.length === 0) return;

        // Создаем Intersection Observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                const newlyVisible = [];

                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const messageId = entry.target.dataset.messageId;
                        // Проверяем, не обрабатывали ли уже это сообщение
                        if (!processedMessages.has(messageId)) {
                            newlyVisible.push(messageId);
                            setProcessedMessages(prev => new Set([...prev, messageId]));
                        }
                    }
                });

                // Если есть новые видимые непрочитанные сообщения - отмечаем как прочитанные
                if (newlyVisible.length > 0) {
                    markMessagesAsRead(newlyVisible, chatId);
                }
            },
            {
                threshold: 0.7, // 70% видимости сообщения
                rootMargin: '50px' // Небольшой запас
            }
        );

        // Начинаем наблюдение за всеми непрочитанными сообщениями
        unreadMessages.forEach(({ element }) => {
            observerRef.current.observe(element);
        });

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [messages, currentUserId, chatId, markMessagesAsRead, processedMessages]);

    return { processedMessages };
};
export default useMarkMessagesRead;