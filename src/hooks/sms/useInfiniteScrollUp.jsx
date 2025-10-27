import { useEffect, useRef } from 'react';

/**
 * Хук для подгрузки сообщений при скролле вверх.
 * Работает даже если DOM-элементы пересоздаются при обновлении.
 *
 * @param {object} params
 * @param {React.RefObject} params.containerRef
 * @param {function} params.fetchMoreMessages
 * @param {boolean} params.hasMore
 * @param {number} [params.offset=100]
 * @param {string} [params.messageSelector='.message']
 * @param {function} [params.getMessageId] - функция, возвращающая уникальный id сообщения по DOM-элементу
 */
export const useInfiniteScrollUp = ({
                                        containerRef,
                                        fetchMoreMessages,
                                        hasMore,
                                        offset = 100,
                                        messageSelector = '.message',
                                        getMessageId = (el) => el.dataset.id,
                                        imageLoadTimeout = 2000, // макс ждать загрузку картинок (ms)
                                    }) => {
    const isFetchingRef = useRef(false);
    const topVisibleIdRef = useRef(null);
    const topVisibleOffsetTopRef = useRef(0);
    const prevScrollTopRef = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !fetchMoreMessages) return;

        // Сохраняем верхнее видимое сообщение (id и offsetTop)
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visible.length > 0) {
                    const topEl = visible[0].target;
                    topVisibleIdRef.current = getMessageId(topEl);
                    // offsetTop даёт позицию внутри контента (от начала scrollable)
                    topVisibleOffsetTopRef.current = topEl.offsetTop;
                    prevScrollTopRef.current = container.scrollTop;

                    console.log('OBSERVER topVisibleIdRef', topVisibleIdRef.current)
                    console.log('OBSERVER topVisibleOffsetTopRef', topVisibleOffsetTopRef.current)
                    console.log('OBSERVER prevScrollTopRef', prevScrollTopRef.current)
                }
            },
            { root: container, threshold: 0 }
        );

        const observeMessages = () => {
            const messages = container.querySelectorAll(messageSelector);
            messages.forEach((m) => observer.observe(m));
        };

        observeMessages();

        const waitImagesLoaded = (root, timeout = 2000) => {
            const imgs = Array.from(root.querySelectorAll('img'));
            if (imgs.length === 0) return Promise.resolve();

            const pending = imgs
                .filter((img) => !img.complete)
                .map((img) =>
                    new Promise((res) => {
                        const onDone = () => {
                            img.removeEventListener('load', onDone);
                            img.removeEventListener('error', onDone);
                            res();
                        };
                        img.addEventListener('load', onDone);
                        img.addEventListener('error', onDone);
                    })
                );

            if (pending.length === 0) return Promise.resolve();

            // ограничиваем ожидание таймаутом
            return Promise.race([
                Promise.all(pending),
                new Promise((res) => setTimeout(res, timeout)),
            ]);
        };

        const handleScroll = async () => {
            if (isFetchingRef.current || !hasMore) return;
            if (container.scrollTop > offset) return;

            isFetchingRef.current = true;

            // Сохраняем id и позицию (offsetTop) до подгрузки
            const savedId = topVisibleIdRef.current;
            const savedOffsetTop = topVisibleOffsetTopRef.current;
            const savedScrollTop = prevScrollTopRef.current ?? container.scrollTop;
            const prevScrollHeight = container.scrollHeight;

            console.log('SCROLL savedId', savedId)
            console.log('SCROLL savedOffsetTop', savedOffsetTop)
            console.log('SCROLL savedScrollTop', savedScrollTop)
            console.log('SCROLL prevScrollHeight', prevScrollHeight)

            // Выполняем подгрузку
            await fetchMoreMessages();
            console.log('— после fetch, до RAF —', container.scrollHeight);
            // Ждём, пока картинки загрузятся и DOM стабилизируется
            await waitImagesLoaded(container, imageLoadTimeout);

            // Двойной rAF — помогает дождаться реального layout
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (savedId != null) {
                        console.log('— после 2x RAF —', container.scrollHeight);
                        const newScrollHeight = container.scrollHeight;
                        const selector = `${messageSelector}[data-id="${savedId}"]`;
                        const sameMessage = container.querySelector(selector);

                        if (sameMessage) {
                            const newOffsetTop = sameMessage.offsetTop;
                            const delta = newOffsetTop - (savedOffsetTop || 0);

                            // Если newOffsetTop не изменился — компенсируем разницу по scrollHeight
                            const scrollHeightDiff = newScrollHeight - prevScrollHeight;

                            const adjustedScrollTop = (savedScrollTop || 0) + (delta || scrollHeightDiff);

                            container.scrollTop = adjustedScrollTop;

                            console.log('SCROLL delta', delta);
                            console.log('SCROLL heightDiff', scrollHeightDiff);
                            console.log('SCROLL final', adjustedScrollTop);
                        }
                    }

                    // Обновляем наблюдаемую коллекцию сообщений
                    observer.disconnect();
                    observeMessages();

                    isFetchingRef.current = false;
                });
            });
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, [
        containerRef,
        fetchMoreMessages,
        hasMore,
        offset,
        messageSelector,
        getMessageId,
        imageLoadTimeout,
    ]);
};