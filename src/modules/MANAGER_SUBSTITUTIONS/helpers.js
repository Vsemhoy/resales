export const fullName = (person) =>
    [person?.surname, person?.name, person?.secondname].filter(Boolean).join(' ') || '—';

export const moscowToday = (now = new Date()) => {
    const parts = new Intl.DateTimeFormat('en', {
        timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(now);
    const value = (type) => parts.find((part) => part.type === type).value;
    return `${value('year')}-${value('month')}-${value('day')}`;
};

export const substitutionStatus = (record, today = moscowToday()) => {
    if (record.revoked_at) return { key: 'revoked', label: 'Отключено', color: 'default' };
    if (today < record.starts_on) return { key: 'scheduled', label: 'Запланировано', color: 'blue' };
    if (today > record.ends_on) return { key: 'completed', label: 'Завершено', color: 'default' };
    return { key: 'active', label: 'Действует', color: 'green' };
};

export const errorMessage = (error) => {
    if (error.response?.status === 403) return 'Недостаточно прав для этого действия.';
    if (error.response?.status === 404) return 'Замещение не найдено или относится к другой компании. Обновите список.';
    if (error.response?.status === 422) return 'Проверьте введённые данные.';
    return 'Не удалось выполнить запрос. Попробуйте ещё раз.';
};
