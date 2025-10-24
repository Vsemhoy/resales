import {useEffect, useLayoutEffect, useRef, useState} from 'react';

/**
 * Хук для подгрузки данных при скролле вверх.
 *
 * @param {object} params
 * @param {React.RefObject} params.containerRef - ref на скроллируемый контейнер
 * @param {function} params.fetchMoreMessages - функция для подгрузки данных
 * @param {boolean} params.hasMore - есть ли ещё данные для подгрузки
 * @param {number} [params.offset=100] - сколько пикселей от верха считать "почти докрутили"
 */
export const useInfiniteScrollUp = ({
                                        containerRef,
                                        fetchMoreMessages,
                                        hasMore,
                                        offset = 150,
                                    }) => {
    const isFetchingRef = useRef(false);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container || !fetchMoreMessages) return;

        const handleScroll = async () => {
            if (isFetchingRef.current || !hasMore) return;

            if (container.scrollTop <= offset) {
                isFetchingRef.current = true;

                const prevScrollHeight = container.scrollHeight;
                const prevScrollTop = container.scrollTop;

                try {
                    await fetchMoreMessages();
                } finally {
                    // Используем двойной requestAnimationFrame для плавности без лагов
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            const newScrollHeight = container.scrollHeight;
                            container.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
                            isFetchingRef.current = false;
                        });
                    });
                }
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [containerRef, fetchMoreMessages, hasMore, offset]);
};
