import { useEffect, useRef, useState } from 'react';

/**
 * Хук для подгрузки данных при скролле вверх.
 *
 * @param {object} params
 * @param {React.RefObject} params.containerRef - ref на скроллируемый контейнер
 * @param {function} params.fetchMoreMessages - функция для подгрузки данных
 * @param {boolean} params.hasMore - есть ли ещё данные для подгрузки
 * @param {number} [params.offset=100] - сколько пикселей от верха считать "почти докрутили"
 */
export const useInfiniteScrollUp = ({ containerRef, fetchMoreMessages, hasMore, offset = 150 }) => {
    const isFetchingRef = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !fetchMoreMessages) return;

        const handleScroll = async () => {
            // Блокируем повторные вызовы
            if (isFetchingRef.current || !hasMore) return;

            if (container.scrollTop <= offset) {
                isFetchingRef.current = true;
                const prevScrollHeight = container.scrollHeight;

                try {
                    await fetchMoreMessages();
                } finally {
                    // Корректируем позицию скролла, чтобы не прыгал
                    requestAnimationFrame(() => {
                        const newScrollHeight = container.scrollHeight;
                        container.scrollTop =
                            newScrollHeight - prevScrollHeight + container.scrollTop;
                        setTimeout(() => {
                            isFetchingRef.current = false;
                        }, 300);
                    });
                }
            }
        };

        container.addEventListener('scroll', handleScroll);

        return () => container.removeEventListener('scroll', handleScroll);
    }, [containerRef, fetchMoreMessages, hasMore, offset]);
};
