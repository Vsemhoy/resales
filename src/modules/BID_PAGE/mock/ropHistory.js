// Временная заглушка до появления API истории изменений полей.
const examples = [
    ['Комментарий', 'Уточнить условия доставки', 'Доставка согласована'],
    ['Скидка, %', 0, 5],
    ['Сумма', 125000, 118750],
    ['Статус', 'В работе', 'На согласовании'],
    ['Срок поставки', '10 рабочих дней', '7 рабочих дней'],
    ['Номер счёта', null, 'ТЕСТ-001'],
];

const rows = Array.from({ length: 47 }, (_, index) => {
    const [field, old_value, new_value] = examples[index % examples.length];
    return {
        id: 47 - index,
        field,
        old_value,
        new_value,
        date: new Date(Date.UTC(2026, 8, 16, 9, 0) - index * 3600000).toISOString(),
    };
});

export const getMockBidRopHistory = async (bidId, { page, pageSize }) => ({
    rows: rows.slice((page - 1) * pageSize, page * pageSize),
    total: rows.length,
});
