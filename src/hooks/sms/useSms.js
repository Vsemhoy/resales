import {useEffect, useState} from 'react';
import {CSRF_TOKEN, PRODMODE} from '../../config/config.js';
import {PROD_AXIOS_INSTANCE} from '../../config/Api.js';

export const useSms = ({chatId, mock = {}, search}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [who, setWho] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                let responseData = [];

                if (PRODMODE) {
                    try {
                        const endpoint = chatId ? `/api/sms/${chatId}` : '/api/sms';
                        const response = await PROD_AXIOS_INSTANCE.post(endpoint, {
                            data: {search},
                            _token: CSRF_TOKEN,
                        });

                        console.log(`[useSms] Полный ответ от сервера:`, response.data);
                        console.log(`[useSms] Структура content:`, response?.data?.content);

                        // Проверяем различные возможные структуры ответа
                        let sms;
                        if (chatId) {
                            sms = response?.data?.content?.messages ||
                                response?.data?.content?.sms ||
                                response?.data?.content;
                        } else {
                            sms = response?.data?.content?.sms ||
                                response?.data?.content?.messages ||
                                response?.data?.content;
                        }

                        console.log(`[useSms] Извлеченные SMS:`, sms);

                        setWho(response?.data?.content?.who);

                        if (Array.isArray(sms)) {
                            responseData = sms;
                        } else {
                            console.warn(`[useSms] СМС не является массивом:`, typeof sms, sms);
                            responseData = [];
                        }
                    } catch (err) {
                        console.error(
                            `[useSms] Ошибка при запросе ${chatId ? `/api/sms/${chatId}` : '/api/sms'}:`,
                            err
                        );
                        throw new Error('Не удалось загрузить SMS с сервера');
                    }
                } else {
                    console.log('[useSms] Используются MOCK-данные (dev mode)');

                    const mockData = mock;

                    console.log('[useSms] MOCK-данные:', mockData);

                    const sms = chatId
                        ? mockData?.content?.sms?.filter((msg) => msg.chat_id === chatId)
                        : mockData?.content?.sms;

                    if (Array.isArray(sms)) {
                        responseData = sms;
                    } else {
                        console.warn('[useSms] MOCK-данные не содержат массив sms');
                        responseData = []; // Устанавливаем пустой массив вместо undefined
                    }
                }

                console.log('[useSms] Установка данных:', responseData);
                setData(responseData);
            } catch (err) {
                console.error('[useSms] Ошибка при загрузке данных:', err);
                setError(err.message || 'Неизвестная ошибка');
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [chatId, mock, search]);

    return {data, who, loading, error};
};
