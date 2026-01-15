/**
 * calendarMocks.js
 * 
 * Моки для страниц Календарь и Отчёты
 * 
 * СТРУКТУРА:
 * - EVENT_TYPES — типы событий для фильтрации и отображения
 * - MOCK_DEPARTMENTS — отделы (общие для всех филиалов)
 * - MOCK_USERS — вымышленные пользователи
 * - MOCK_ORGANIZATIONS — организации-клиенты
 * - MOCK_CALENDAR_EVENTS — события календаря (сводная таблица)
 * - MOCK_EVENT_COMMENTS — комментарии к событиям
 * - MOCK_USER_NOTES — персональные заметки (приватные/публичные)
 * - Справочники проектов
 * - Хелперы и утилиты
 */

import dayjs from 'dayjs';

// =============================================================================
// ТИПЫ СОБЫТИЙ
// =============================================================================
 
export const EVENT_TYPES = [
  {
    id: 0,
    name: 'Все',
    color: '#c2cceb',
    title: 'Вывод всех типов событий',
    sort_order: 0,
    real: 0,
    disabled: 0,
    noreport: 1,
  },
  {
    id: 1,
    name: 'КП',
    color: '#8eaaff',
    title: 'Создание коммерческого предложения',
    sort_order: 0,
    real: 1,
    disabled: 0,
  },
  {
    id: 2,
    name: 'Счёт',
    color: '#85ffda',
    title: 'Создание счёта',
    sort_order: 0,
    real: 1,
    disabled: 0,
  },
  {
    id: 3,
    name: 'Счёт к администратору',
    color: '#52e6b9',
    title: 'Отправка счёта к администратору',
    sort_order: 0,
    real: 1,
    disabled: 0,
  },
  {
    id: 4,
    name: 'Счёт к бухгалтеру',
    color: '#33d1a2',
    title: 'Отправка счёта от админа к бухгалтеру',
    sort_order: 0,
    real: 1,
    disabled: 0,
  },
  {
    id: 5,
    name: 'Счёт завершён',
    color: '#09af7d',
    title: 'Завершение сделки',
    sort_order: 0,
    real: 1,
    disabled: 0,
  },
  {
    id: 6,
    name: 'Встреча',
    color: '#f7ed59',
    title: 'Встреча с представителями компании',
    sort_order: 1,
    real: 1,
    disabled: 0,
  },
  {
    id: 7,
    name: 'Звонок',
    color: '#faa781',
    title: 'Звонки клиентам',
    sort_order: 2,
    real: 1,
    disabled: 0,
  },
  {
    id: 8,
    name: 'Запрос на кураторство',
    color: '#7997fa',
    title: 'Запрос на кураторство',
    sort_order: 3,
    real: 1,
    disabled: 0,
  },
  {
    id: 9,
    name: 'Взятие кураторства',
    color: '#59e5f7',
    title: 'Взял кураторство над компанией',
    sort_order: 4,
    real: 1,
    disabled: 0,
  },
  {
    id: 10,
    name: 'Заметка',
    color: '#d38efc',
    title: 'Какая-то информация по компании',
    sort_order: 5,
    real: 1,
    disabled: 0,
  },
  {
    id: 11,
    name: 'Добавление контакта',
    color: '#ca6f7e',
    title: 'Добавил контакт в карточку клиента',
    sort_order: 6,
    real: 1,
    disabled: 0,
  },
  {
    id: 12,
    name: 'Обновление контакта',
    color: '#dfa4ad',
    title: 'Обновил данные в карточке клиента',
    sort_order: 7,
    real: 1,
    disabled: 0,
  },
  {
    id: 13,
    name: 'Проект',
    color: '#5554aa',
    title: 'Внесение в базу проекта',
    sort_order: 8,
    real: 1,
    disabled: 0,
  },
  {
    id: 14,
    name: 'Мои заметки',
    color: '#7c636f',
    title: 'Приватные заметки могу читать только я',
    sort_order: 9,
    real: 1,
    noreport: 1,
    disabled: 0,
  },
  {
    id: 15,
    name: 'Публичные заметки',
    color: '#a08389',
    title: 'Заметки, которые видны всем',
    sort_order: 10,
    real: 1,
    disabled: 0,
  },
  {
    id: 16,
    name: 'Карточка клиента',
    color: '#ccf04a',
    title: 'Создане новой карточки клиента',
    sort_order: 99,
    real: 0,
    disabled: 0,
    noreport: 0,
  },
  {
    id: 17,
    name: 'Любая активность',
    color: '#d8d8d8ff',
    title: 'Сотрудник что-то делал',
    sort_order: 99,
    real: 0,
    disabled: 0,
    noreport: 1,
  },
];

// Типы, доступные для создания из календаря
export const CREATABLE_EVENT_TYPES = [6, 7, 10, 13, 14, 15];

// Типы для отчётов (исключаем noreport)
export const REPORT_EVENT_TYPES = EVENT_TYPES.filter(t => t.real === 1 && !t.noreport);

// =============================================================================
// ОТДЕЛЫ (общие для всех филиалов)
// =============================================================================

export const MOCK_DEPARTMENTS = [
  { id: 1, name: 'Администрация', rang: 1, visible: 1 },
  { id: 2, name: 'Отдел персонала', rang: 30, visible: 1 },
  { id: 3, name: 'Бухгалтерия', rang: 10, visible: 1 },
  { id: 5, name: 'Отдел оптовых продаж', rang: 50, visible: 1 },
  { id: 6, name: 'Отдел рекламы', rang: 70, visible: 1 },
  { id: 7, name: 'Технический отдел трансляционного звука', rang: 60, visible: 1 },
  { id: 8, name: 'Проектный отдел', rang: 100, visible: 1 },
  { id: 9, name: 'Склад', rang: 120, visible: 1 },
  { id: 14, name: 'Отдел информационных технологий', rang: 90, visible: 1 },
  { id: 15, name: 'Отдел информации', rang: 40, visible: 1 },
];

// =============================================================================
// ПОЛЬЗОВАТЕЛИ (вымышленные)
// =============================================================================

export const MOCK_USERS = [
  // Филиал 2 (Arstel)
  {
    user_id: 101,
    user_name: 'Александр',
    user_surname: 'Петров',
    user_patronymic: 'Сергеевич',
    user_occupy: 'Руководитель отдела продаж',
    department_id: 5,
    department_name: 'Отдел оптовых продаж',
    id_company: 2,
    is_boss: 1,
  },
  {
    user_id: 102,
    user_name: 'Мария',
    user_surname: 'Иванова',
    user_patronymic: 'Александровна',
    user_occupy: 'Менеджер по продажам',
    department_id: 5,
    department_name: 'Отдел оптовых продаж',
    id_company: 2,
    is_boss: 0,
  },
  {
    user_id: 103,
    user_name: 'Дмитрий',
    user_surname: 'Сидоров',
    user_patronymic: 'Владимирович',
    user_occupy: 'Менеджер по продажам',
    department_id: 5,
    department_name: 'Отдел оптовых продаж',
    id_company: 2,
    is_boss: 0,
  },
  {
    user_id: 104,
    user_name: 'Елена',
    user_surname: 'Козлова',
    user_patronymic: 'Игоревна',
    user_occupy: 'Старший менеджер',
    department_id: 5,
    department_name: 'Отдел оптовых продаж',
    id_company: 2,
    is_boss: 0,
  },
  {
    user_id: 105,
    user_name: 'Андрей',
    user_surname: 'Морозов',
    user_patronymic: 'Петрович',
    user_occupy: 'Инженер-проектировщик',
    department_id: 8,
    department_name: 'Проектный отдел',
    id_company: 2,
    is_boss: 0,
  },
  {
    user_id: 106,
    user_name: 'Ольга',
    user_surname: 'Новикова',
    user_patronymic: 'Дмитриевна',
    user_occupy: 'Руководитель проектного отдела',
    department_id: 8,
    department_name: 'Проектный отдел',
    id_company: 2,
    is_boss: 1,
  },
  {
    user_id: 107,
    user_name: 'Сергей',
    user_surname: 'Волков',
    user_patronymic: 'Анатольевич',
    user_occupy: 'Бухгалтер',
    department_id: 3,
    department_name: 'Бухгалтерия',
    id_company: 2,
    is_boss: 0,
  },
  
  // Филиал 3 (Rondo)
  {
    user_id: 201,
    user_name: 'Игорь',
    user_surname: 'Кузнецов',
    user_patronymic: 'Михайлович',
    user_occupy: 'Руководитель отдела продаж',
    department_id: 5,
    department_name: 'Отдел оптовых продаж',
    id_company: 3,
    is_boss: 1,
  },
  {
    user_id: 202,
    user_name: 'Анна',
    user_surname: 'Соколова',
    user_patronymic: 'Викторовна',
    user_occupy: 'Менеджер по продажам',
    department_id: 5,
    department_name: 'Отдел оптовых продаж',
    id_company: 3,
    is_boss: 0,
  },
  {
    user_id: 203,
    user_name: 'Павел',
    user_surname: 'Лебедев',
    user_patronymic: 'Олегович',
    user_occupy: 'Менеджер по продажам',
    department_id: 5,
    department_name: 'Отдел оптовых продаж',
    id_company: 3,
    is_boss: 0,
  },
];

// =============================================================================
// ОРГАНИЗАЦИИ (клиенты)
// =============================================================================

export const MOCK_ORGANIZATIONS = [
  {
    id: 27,
    name: "Проектный институт 'Карелагропромпроект'",
    id_company: 2,
  },
  {
    id: 100,
    name: 'ООО "Технопром"',
    id_company: 2,
  },
  {
    id: 101,
    name: 'АО "СтройИнвест"',
    id_company: 2,
  },
  {
    id: 102,
    name: 'ИП Сергеев А.В.',
    id_company: 2,
  },
  {
    id: 103,
    name: 'ООО "Аудиосистемы"',
    id_company: 2,
  },
  {
    id: 104,
    name: 'ЗАО "МедиаГрупп"',
    id_company: 2,
  },
  {
    id: 200,
    name: 'ООО "Северный ветер"',
    id_company: 3,
  },
  {
    id: 201,
    name: 'АО "Балтийские системы"',
    id_company: 3,
  },
  {
    id: 202,
    name: 'ИП Михайлов П.С.',
    id_company: 3,
  },
];

// =============================================================================
// СПРАВОЧНИКИ ПРОЕКТОВ
// =============================================================================

export const ORG_PROJECT_STATES = [
  { id: 0, value: 0, key: 'orpros_1', label: 'Текущий' },
  { id: 1, value: 1, key: 'orpros_2', label: 'Реализованный' },
  { id: 2, value: 2, key: 'orpros_3', label: 'Предстоящий' },
  { id: 3, value: 3, key: 'orpros_4', label: 'Выполненный' },
];

export const ORG_PROJECT_DEFENSES = [
  { id: 0, value: 0, key: 'opd_1', label: 'Не выбрано' },
  { id: 1, value: 1, key: 'opd_2', label: 'Защита проекта' },
  { id: 2, value: 2, key: 'opd_3', label: 'Реализация проекта' },
  { id: 3, value: 3, key: 'opd_4', label: 'Защита и реализация' },
];

// =============================================================================
// ПЕРСОНАЛЬНЫЕ ЗАМЕТКИ (user_notes) - типы 14 и 15
// =============================================================================

export const MOCK_USER_NOTES = [
  {
    id: 1,
    user_id: 102,
    id_company: 2,
    title: 'Напомнить про оплату',
    content: 'Позвонить в ООО Технопром по поводу задержки оплаты счёта #4521. Контакт: Иванов Пётр, +7-999-123-45-67',
    is_private: 1,
    org_id: 100,
    note_date: '2025-12-27',
    created_at: '2025-12-27T09:00:00',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: 2,
    user_id: 102,
    id_company: 2,
    title: 'Идеи по презентации',
    content: 'Добавить слайды с кейсами по трансляционному оборудованию. Уточнить у техотдела актуальные фото монтажей.',
    is_private: 1,
    org_id: null,
    note_date: '2025-12-26',
    created_at: '2025-12-26T14:30:00',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: 3,
    user_id: 103,
    id_company: 2,
    title: 'Важно для всех: новый прайс',
    content: 'С 1 января обновляется прайс-лист на оборудование Inter-M. Скидки для дилеров пересмотрены. Подробности у руководителя.',
    is_private: 0,
    org_id: null,
    note_date: '2025-12-25',
    created_at: '2025-12-25T10:00:00',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: 4,
    user_id: 101,
    id_company: 2,
    title: 'План на январь',
    content: 'Обзвон базы клиентов из сегмента HoReCa. Подготовить спецпредложение на комплекты оборудования.',
    is_private: 0,
    org_id: null,
    note_date: '2025-12-28',
    created_at: '2025-12-24T16:00:00',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: 5,
    user_id: 102,
    id_company: 2,
    title: 'Личное: день рождения клиента',
    content: 'У Сергеева А.В. день рождения 15 января. Подготовить поздравление и небольшой подарок.',
    is_private: 1,
    org_id: 102,
    note_date: '2026-01-15',
    created_at: '2025-12-20T11:00:00',
    updated_at: null,
    deleted_at: null,
  },
  // Филиал 3
  {
    id: 6,
    user_id: 202,
    id_company: 3,
    title: 'Встреча с Балтийскими системами',
    content: 'Подготовить демо-комплект для презентации. Взять с собой каталоги и USB с видео.',
    is_private: 1,
    org_id: 201,
    note_date: '2025-12-30',
    created_at: '2025-12-26T09:00:00',
    updated_at: null,
    deleted_at: null,
  },
];

// =============================================================================
// СОБЫТИЯ КАЛЕНДАРЯ (calendar_events) - сводная таблица
// =============================================================================

// Генератор событий для более реалистичных данных
const generateCalendarEvents = () => {
  const events = [];
  let eventId = 1;
  
  const today = dayjs();
  
  // Генерируем события за последние 3 месяца и на месяц вперёд
  const startDate = today.subtract(3, 'month');
  const endDate = today.add(1, 'month');
  
  // Пользователи филиала 2
  const users2 = MOCK_USERS.filter(u => u.id_company === 2);
  // Организации филиала 2
  const orgs2 = MOCK_ORGANIZATIONS.filter(o => o.id_company === 2);
  
  // Пользователи филиала 3
  const users3 = MOCK_USERS.filter(u => u.id_company === 3);
  // Организации филиала 3
  const orgs3 = MOCK_ORGANIZATIONS.filter(o => o.id_company === 3);

  // Хелпер для создания события
  const createEvent = (userId, userName, deptId, companyId, type, org, date, content, extra = {}) => ({
    id: eventId++,
    user_id: userId,
    user_name: userName,
    // department_id: deptId,
    id_company: companyId,
    type: type,
    // type_id: Math.floor(Math.random() * 10000) + 1000,
    // type_table: getTypeTable(type),
    // org_id: org?.id || null,
    org_name: org?.name || null,
    // is_curator: Math.random() > 0.5 ? 1 : 0,
    event_date: date.format('YYYY-MM-DD'),
    event_time: `${String(9 + Math.floor(Math.random() * 8)).padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}:00`,
    // created_at: date.format('YYYY-MM-DDTHH:mm:ss'),
    // updated_at: null,
    // deleted_at: null,
    // content: content,
    // private: extra.private || 0,
    // amount: extra.amount || null,
    // status: extra.status || null,
    // parent_event_id: extra.parent_event_id || null,
    // comments_count: Math.floor(Math.random() * 3),
    // ...extra,
  });

  // Генерируем события для каждого рабочего дня
  let currentDate = startDate;
  while (currentDate.isBefore(endDate)) {
    const dayOfWeek = currentDate.day();
    
    // Пропускаем выходные (меньше событий)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      currentDate = currentDate.add(1, 'day');
      continue;
    }

    // Филиал 2 - генерируем 3-8 событий в день
    const eventsCount2 = 3 + Math.floor(Math.random() * 6);
    for (let i = 0; i < eventsCount2; i++) {
      const user = users2[Math.floor(Math.random() * users2.length)];
      const org = orgs2[Math.floor(Math.random() * orgs2.length)];
      const type = getRandomEventType();
      
      events.push(createEvent(
        user.user_id,
        `${user.user_surname} ${user.user_name[0]}.${user.user_patronymic[0]}.`,
        user.department_id,
        user.id_company,
        type,
        type >= 6 ? org : null, // Для КП/счетов орг не нужна в этом контексте
        currentDate,
        generateContent(type, org),
        generateExtra(type)
      ));
    }

    // Филиал 3 - генерируем 2-5 событий в день
    const eventsCount3 = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < eventsCount3; i++) {
      const user = users3[Math.floor(Math.random() * users3.length)];
      const org = orgs3[Math.floor(Math.random() * orgs3.length)];
      const type = getRandomEventType();
      
      events.push(createEvent(
        user.user_id,
        `${user.user_surname} ${user.user_name[0]}.${user.user_patronymic[0]}.`,
        user.department_id,
        user.id_company,
        type,
        type >= 6 ? org : null,
        currentDate,
        generateContent(type, org),
        generateExtra(type)
      ));
    }

    currentDate = currentDate.add(1, 'day');
  }

  return events;
};

// Вспомогательные функции для генератора
const getTypeTable = (type) => {
  const tables = {
    1: 'bids', 2: 'bids', 3: 'bids', 4: 'bids', 5: 'bids',
    6: 'orgs_meetings', 7: 'orgs_calls',
    8: 'curator_requests', 9: 'orgs',
    10: 'orgs_notes', 11: 'orgsusers', 12: 'orgsusers',
    13: 'projects', 14: 'user_notes', 15: 'user_notes',
  };
  return tables[type] || null;
};

const getRandomEventType = () => {
  // Вес для разных типов (звонки и заметки чаще)
  const weights = {
    1: 5,   // КП
    2: 3,   // Счёт
    3: 2,   // Счёт к админу
    4: 2,   // Счёт к бухгалтеру
    5: 1,   // Счёт завершён
    6: 4,   // Встреча
    7: 15,  // Звонок (самый частый)
    8: 1,   // Запрос кураторства
    9: 1,   // Взятие кураторства
    10: 8,  // Заметка
    11: 2,  // Добавление контакта
    12: 3,  // Обновление контакта
    13: 3,  // Проект
    14: 2,  // Приватная заметка
    15: 2,  // Публичная заметка
  };
  
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (const [type, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) return parseInt(type);
  }
  return 7; // fallback - звонок
};

const generateContent = (type, org) => {
  const orgName = org?.name || 'клиент';
  
  const contents = {
    1: [`КП на поставку оборудования для ${orgName}`, `Коммерческое предложение по запросу`, `КП на комплект трансляционного оборудования`],
    2: [`Счёт на оплату оборудования`, `Счёт по договору поставки`, `Счёт на предоплату`],
    3: [`Счёт передан на проверку администратору`, `Ожидает согласования`],
    4: [`Счёт передан в бухгалтерию`, `На оплате`],
    5: [`Сделка завершена успешно`, `Оплата получена, отгрузка выполнена`],
    6: [`Встреча с представителями ${orgName}`, `Презентация оборудования`, `Обсуждение проекта`],
    7: [`Звонок в ${orgName}`, `Уточнение потребностей`, `Обсуждение условий поставки`, `Согласование сроков`],
    8: [`Запрос на кураторство над ${orgName}`],
    9: [`Взял кураторство над ${orgName}`],
    10: [`Информация по ${orgName}`, `Заметка о контакте`, `Важная информация`],
    11: [`Добавлен новый контакт в карточку ${orgName}`],
    12: [`Обновлены данные контакта в ${orgName}`],
    13: [`Новый проект для ${orgName}`, `Проект по оснащению`, `Техническое задание`],
    14: [`Личная заметка`, `Напоминание`, `TODO`],
    15: [`Информация для коллег`, `Общая заметка`, `Важно для всех`],
  };
  
  const typeContents = contents[type] || ['Событие'];
  return typeContents[Math.floor(Math.random() * typeContents.length)];
};

const generateExtra = (type) => {
  const extra = {};
  
  // Для КП и счетов добавляем сумму
  if (type >= 1 && type <= 5) {
    extra.amount = Math.floor(Math.random() * 500000) + 10000;
    extra.status = ['draft', 'sent', 'approved', 'paid'][Math.floor(Math.random() * 4)];
  }
  
  // Для приватных заметок
  if (type === 14) {
    extra.private = 1;
  }
  
  return extra;
};

// Генерируем события
export const MOCK_CALENDAR_EVENTS = generateCalendarEvents();

// =============================================================================
// КОММЕНТАРИИ К СОБЫТИЯМ
// =============================================================================

export const MOCK_EVENT_COMMENTS = [
  {
    id: 1,
    event_id: 1,
    user_id: 101,
    user_name: 'Петров А.С.',
    id_company: 2,
    content: 'Уточни сроки поставки, клиент торопится',
    created_at: '2025-12-20T11:30:00',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: 2,
    event_id: 1,
    user_id: 102,
    user_name: 'Иванова М.А.',
    id_company: 2,
    content: 'Сроки согласованы: 2 недели с момента оплаты',
    created_at: '2025-12-20T14:15:00',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: 3,
    event_id: 5,
    user_id: 103,
    user_name: 'Сидоров Д.В.',
    id_company: 2,
    content: 'Отличная работа! Клиент доволен.',
    created_at: '2025-12-22T09:00:00',
    updated_at: null,
    deleted_at: null,
  },
    {
    id: 4,
    event_id: 1,
    user_id: 46,
    user_name: 'Крудо А.С.',
    id_company: 2,
    content: 'Data visualization color palette is based on the basic color palette and neutral color palette, and based on the principle that AntVs "effective, clear, accurate and beautiful". View Palette',
    created_at: '2025-12-20T11:30:00',
    updated_at: null,
    deleted_at: null,
  },
];

// =============================================================================
// ХЕЛПЕРЫ И УТИЛИТЫ
// =============================================================================

/**
 * Получить тип события по ID
 */
export const getEventTypeById = (id) => EVENT_TYPES.find(t => t.id === id);

/**
 * Получить цвет типа события
 */
export const getEventTypeColor = (typeId) => {
  const type = getEventTypeById(typeId);
  return type?.color || '#c2cceb';
};

/**
 * Получить название типа события
 */
export const getEventTypeName = (typeId) => {
  const type = getEventTypeById(typeId);
  return type?.name || 'Событие';
};

/**
 * Фильтрация событий по параметрам
 */
export const filterEvents = (events, filters) => {
  let filtered = [...events];
  
  // По филиалу
  if (filters.companyId) {
    filtered = filtered.filter(e => e.id_company === filters.companyId);
  }
  
  // По пользователям
  if (filters.userIds?.length > 0) {
    filtered = filtered.filter(e => filters.userIds.includes(e.user_id));
  }
  
  // По типам
  if (filters.types?.length > 0 && !filters.types.includes(0)) {
    filtered = filtered.filter(e => filters.types.includes(e.type));
  }
  
  // По диапазону дат
  if (filters.dateFrom) {
    filtered = filtered.filter(e => e.event_date >= filters.dateFrom);
  }
  if (filters.dateTo) {
    filtered = filtered.filter(e => e.event_date <= filters.dateTo);
  }
  
  // По наличию комментариев
  if (filters.hasComments) {
    filtered = filtered.filter(e => e.comments_count > 0);
  }
  
  // Исключаем приватные чужие заметки
  if (filters.currentUserId) {
    filtered = filtered.filter(e => 
      e.private !== 1 || e.user_id === filters.currentUserId
    );
  }
  
  return filtered;
};

/**
 * Группировка событий по дате
 */
export const groupEventsByDate = (events) => {
  return events.reduce((acc, event) => {
    const date = event.event_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});
};

/**
 * Подсчёт событий по типам для пользователя
 */
export const countEventsByType = (events, userId = null) => {
  const filtered = userId ? events.filter(e => e.user_id === userId) : events;
  
  return filtered.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});
};

/**
 * Генерация данных для heatmap (минимапа)
 */
export const generateHeatmapData = (events, year = dayjs().year()) => {
  const startOfYear = dayjs().year(year).startOf('year');
  const endOfYear = dayjs().year(year).endOf('year');
  
  const heatmap = {};
  
  // Инициализируем все дни года
  let current = startOfYear;
  while (current.isBefore(endOfYear) || current.isSame(endOfYear, 'day')) {
    heatmap[current.format('YYYY-MM-DD')] = { count: 0, types: {} };
    current = current.add(1, 'day');
  }
  
  // Заполняем данными
  events.forEach(event => {
    if (event.event_date.startsWith(String(year))) {
      const date = event.event_date;
      if (heatmap[date]) {
        heatmap[date].count++;
        heatmap[date].types[event.type] = (heatmap[date].types[event.type] || 0) + 1;
      }
    }
  });
  
  return heatmap;
};

/**
 * Получить интенсивность для heatmap (0-4)
 */
export const getHeatmapIntensity = (count) => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
};

/**
 * Генерация данных для таблицы отчётов
 */
export const generateReportTableData = (events, users) => {
  const reportTypes = REPORT_EVENT_TYPES.map(t => t.id);
  
  return users.map(user => {
    const userEvents = events.filter(e => e.user_id === user.user_id);
    const counts = countEventsByType(userEvents);
    
    const row = {
      user_id: user.user_id,
      user_name: `${user.user_surname} ${user.user_name[0]}.${user.user_patronymic[0]}.`,
      user_full_name: `${user.user_surname} ${user.user_name} ${user.user_patronymic}`,
      department_id: user.department_id,
      department_name: user.department_name,
      total: userEvents.length,
    };
    
    // Добавляем счётчики по каждому типу
    reportTypes.forEach(typeId => {
      row[`type_${typeId}`] = counts[typeId] || 0;
    });
    
    return row;
  });
};

/**
 * Подсчёт итогов для таблицы отчётов
 */
export const calculateReportTotals = (reportData) => {
  const totals = { user_name: 'ИТОГО', total: 0 };
  
  REPORT_EVENT_TYPES.forEach(type => {
    totals[`type_${type.id}`] = 0;
  });
  
  reportData.forEach(row => {
    totals.total += row.total;
    REPORT_EVENT_TYPES.forEach(type => {
      totals[`type_${type.id}`] += row[`type_${type.id}`] || 0;
    });
  });
  
  return totals;
};

// =============================================================================
// API ЗАГЛУШКИ
// =============================================================================

/**
 * Имитация загрузки событий календаря
 */
export const fetchCalendarEvents = async (filters) => {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

  return filterEvents(MOCK_CALENDAR_EVENTS, filters);
};

/**
 * Имитация загрузки списка пользователей
 */
export const fetchUsers = async (companyId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (companyId) {
    return MOCK_USERS.filter(u => u.id_company === companyId);
  }
  return MOCK_USERS;
};

/**
 * Имитация загрузки комментариев к событию
 */
export const fetchEventComments = async (eventId) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  return MOCK_EVENT_COMMENTS.filter(c => c.event_id === eventId);
};

/**
 * Имитация создания события
 */
export const createCalendarEvent = async (eventData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newEvent = {
    id: MOCK_CALENDAR_EVENTS.length + 1,
    ...eventData,
    created_at: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
    comments_count: 0,
  };
  
  MOCK_CALENDAR_EVENTS.push(newEvent);
  return newEvent;
};

/**
 * Имитация добавления комментария
 */
export const addEventComment = async (eventId, userId, userName, companyId, content) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const newComment = {
    id: MOCK_EVENT_COMMENTS.length + 1,
    event_id: eventId,
    user_id: userId,
    user_name: userName,
    id_company: companyId,
    content: content,
    created_at: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
    updated_at: null,
    deleted_at: null,
  };
  
  MOCK_EVENT_COMMENTS.push(newComment);
  
  // Увеличиваем счётчик комментариев
  const event = MOCK_CALENDAR_EVENTS.find(e => e.id === eventId);
  if (event) {
    event.comments_count++;
  }
  
  return newComment;
};

/**
 * Имитация загрузки данных для отчётов
 */
export const fetchReportData = async (filters) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const events = filterEvents(MOCK_CALENDAR_EVENTS, filters);
  const users = filters.userIds?.length > 0
    ? MOCK_USERS.filter(u => filters.userIds.includes(u.user_id))
    : MOCK_USERS.filter(u => u.id_company === filters.companyId);
  
  return {
    events,
    tableData: generateReportTableData(events, users),
    totals: calculateReportTotals(generateReportTableData(events, users)),
  };
};

export default {
  EVENT_TYPES,
  CREATABLE_EVENT_TYPES,
  REPORT_EVENT_TYPES,
  MOCK_DEPARTMENTS,
  MOCK_USERS,
  MOCK_ORGANIZATIONS,
  MOCK_CALENDAR_EVENTS,
  MOCK_EVENT_COMMENTS,
  MOCK_USER_NOTES,
  ORG_PROJECT_STATES,
  ORG_PROJECT_DEFENSES,
};
