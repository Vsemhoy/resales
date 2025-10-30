import { useEffect, useRef, useState } from 'react';

/**
 * Хук который вызывает колбэк метод когда во вьюпорт попадает конкретный объект
 * (например в чате со скроллом появляется непрочитанное сообщение)
 *
 * @param {object} params - объект конфигурации
 * @param {Array} params.messagesWithDividers - сообщения, их количество изменится - сработает хук
 * @param {number} params.currentUserId - id пользователя
 * @param {number} [params.chatId] - id чата
 * @param {React.RefObject} params.containerRef - контейнер с сообщениями, за которым следим
 * @param {function} [params.markMessagesAsRead] - функция срабатываемая при попадании сообщения в обсервер
 */
export const useMarkMessagesRead = ({
                                        messagesWithDividers,
                                        currentUserId,
                                        chatId,
                                        containerRef,
                                        markMessagesAsRead
                                    }) => {
    const observerRef = useRef(null);
    const processedMessagesRef = useRef(new Set());

    useEffect(() => {
        if (!messagesWithDividers.length || !markMessagesAsRead || !containerRef?.current) return;

        const timeout = setTimeout(() => {
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

            const observer = new IntersectionObserver(
                (entries) => {
                    const newlyVisible = [];

                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const messageId = entry.target.dataset.messageId;
                            if (!processedMessagesRef.current.has(messageId)) {
                                newlyVisible.push(messageId);
                                processedMessagesRef.current.add(messageId);
                            }
                        }
                    });

                    if (newlyVisible.length > 0) {
                        markMessagesAsRead(newlyVisible, chatId);
                    }
                },
                {
                    root: containerRef.current,
                    threshold: 0.3,
                    rootMargin: '0px 0px 100px 0px'
                }
            );

            observerRef.current = observer;

            unreadMessages.forEach(({ element }) => observer.observe(element));

        }, 0);

        return () => clearTimeout(timeout);
    }, [messagesWithDividers, currentUserId, chatId, containerRef?.current, markMessagesAsRead]);


    // Очищаем processedMessages при смене чата
    useEffect(() => {
        processedMessagesRef.current.clear();
    }, [chatId]);
};