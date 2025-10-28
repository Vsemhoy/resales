import { useEffect, useRef, useState } from 'react';

/**
 * Хук который вызывает колбэк метод когда во вьюпорт попадает конкретный объект
 * (например в чате со скроллом появляется непрочитанное сообщение)
 *
 * @param {object} params - объект конфигурации
 * @param {Array} params.messagesWithDividers - сообщения, их количество изменится - сработает хук
 * @param {number} params.currentUserId - id пользователя
 * @param {number} [params.chatId] - id чата
 * @param {function} [params.markMessagesAsRead] - функция срабатываемая при попадании сообщения в обсервер
 */
export const useMarkMessagesRead = ({
                                        messagesWithDividers,
                                        currentUserId,
                                        chatId,
                                        markMessagesAsRead
}) => {
    const observerRef = useRef(null);
    const [processedMessages, setProcessedMessages] = useState(new Set());

    useEffect(() => {
        if (!messagesWithDividers.length || !markMessagesAsRead) return;

        // Находим непрочитанные входящие сообщения
        const unreadMessages = messagesWithDividers
            .filter(item => item.type !== 'divider')
            .filter(item => +item.message.fromId !== +currentUserId)
            .filter(item => !item.message.status)
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
    }, [
        messagesWithDividers,
        currentUserId,
        chatId,
        markMessagesAsRead,
        processedMessages
    ]);

    //return { processedMessages };
};
export default useMarkMessagesRead;
