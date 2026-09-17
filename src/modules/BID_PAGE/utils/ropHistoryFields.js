// Названия полей БД в истории сохранений. Подписи редактируемых полей
// соответствуют разделам карточки бида и таблице оборудования.
const bidFields = {
    id: 'ID бида', type: 'Тип документа', object: 'Объект',
    org_id: 'Организация', orguser_id: 'Контактное лицо', user_id: 'Менеджер',
    sellby: 'Срок реализации', comment: 'Комментарий менеджера', deleted: 'Удалён',
    statuskp_id: 'Статус КП', statusmoney_id: 'Статус', statusbid_id: 'Статус бида',
    date: 'Дата создания', conveyance_id: 'Способ транспортировки',
    address_id: 'Фактический адрес', phones_id: 'Телефон', email_id: 'Email',
    requisites_id: 'Плательщик', sturdy_packaging: 'Упаковка', insurance: 'Страховка',
    filename: 'Файл документа', filename_euro: 'Файл документа в евро',
    id8staff_list: 'Куратор', id8an_orgsusers: 'Контактное лицо', id8an_statuskp: 'Статус КП',
    protection_project: 'Защита проекта', emailorg_id: 'Email организации',
    numberbid: 'Номер документа', other_equipment: 'Доп. оборудование',
    inrub: 'Валюта', percent: 'Добавить процент',
    date_update: 'Дата изменения', place: 'Этап', last_message_place: 'Последнее сообщение по этапу',
    rate_usd: 'Курс доллара', rate_euro: 'Курс евро', consignee: 'Грузополучатель',
    bank_progress: 'Банковский прогресс', last_view_user: 'Последний просмотр — пользователь',
    date_last_view: 'Дата последнего просмотра', type_fixed: 'Тип документа зафиксирован',
    concert_bid: 'Концертная заявка', send1c: 'Отправлено в 1С', guid_1C: 'Идентификатор в 1С',
    comment_buh: 'Комментарий бухгалтера', comment_administratora: 'Комментарий администратора',
    comment_engine1: 'Комментарий инженера', comment_engine2: 'Дополнительное оборудование',
    typeTitle: 'Тип заголовка', woNDS: 'Вычесть НДС?', id_company: 'Шаблон',
    last_update_user: 'Автор изменения', pdf_template: 'Шаблон PDF',
    is_need_engineer: 'Требуется инженер', source_id: 'Исходный бид', repair_id: 'Ремонт',
    project_id: 'Связанный проект', project: 'Связанный проект',
    created_at: 'Дата создания', updated_at: 'Дата изменения', deleted_at: 'Дата удаления',
    pdf_acoustic_text: 'Акустические характеристики', pdf_alcons_text: 'Разборчивость речи (ALcons)',
    pdf_choice_text: 'Выбор оборудования', pdf_conclusions_recommendations_text: 'Выводы и рекомендации',
    pdf_direct_spl_text: 'Уровень прямого звукового давления',
    pdf_placing_img: 'Схема размещения оборудования', pdf_reverb_img: 'График реверберации',
    pdf_reverb_img_name: 'Название графика реверберации', pdf_reverb_text: 'Время реверберации',
    pdf_scheme_img: 'Схема подключения', pdf_sti_text: 'Индекс передачи речи (STI)',
    pdf_total_spl_img: 'График суммарного звукового давления',
    pdf_total_spl_img_name: 'Название графика суммарного звукового давления',
    pdf_total_spl_text: 'Суммарное звуковое давление',
};

const modelFields = {
    id: 'ID позиции', bid_id: 'ID бида', model_id: 'ID оборудования',
    model_count: 'Кол-во', percent: 'Процент', presence: 'Наличие', sort: 'Порядок',
};

export const getVisibleModelChanges = changes => {
    const fields = Object.keys(modelFields);
    return changes.filter(change => fields.includes(change.column))
        .sort((a, b) => fields.indexOf(a.column) - fields.indexOf(b.column));
};

export const getRopHistoryFieldLabel = (column, entity = 'bid') =>
    (entity === 'model' ? modelFields : bidFields)[column] || column;

export const getVisibleBidChanges = record =>
    (record.changes?.bid || []).filter(change =>
        change.column !== 'textmodels' && change.column !== 'count_models');

const bidSelectFields = {
    protection_project: 'protection', orguser_id: 'orgUsers', id8an_orgsusers: 'orgUsers',
    id_company: 'companies', inrub: 'currency', statusmoney_id: 'price', woNDS: 'nds',
    requisites_id: 'requisite', conveyance_id: 'conveyance', address_id: 'factAddress',
    phones_id: 'phones', email_id: 'emails', insurance: 'insurance', sturdy_packaging: 'package',
    type: 'type', place: 'stage', project_id: 'projects', project: 'projects',
};

export const getRopHistoryValue = (value, column, entity, selects = {}) => {
    if (value === null || value === undefined || value === '') return value;
    const selectName = entity === 'model'
        ? (column === 'presence' ? 'presence' : undefined)
        : bidSelectFields[column];
    if (!selectName) return value;
    const option = (selects[selectName] || []).find(item =>
        String(item.value ?? item.id) === String(value));
    // Старое значение может отсутствовать в актуальном справочнике.
    return option ? (option.label ?? option.name ?? value) : value;
};
