/**
 * CalendarPage.jsx
 * 
 * Страница календаря событий
 * 
 * СТРУКТУРА:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Заголовок                                                       │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ Фильтры: филиал, сотрудники, типы, с комментами                 │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ Минимап (heatmap за год)                                        │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ [День][Неделя][Месяц][Квартал]     ◀ Декабрь 2025 ▶   [Сегодня] │
 * ├─────────────────────────────────────────┬───────────────────────┤
 * │                                         │                       │
 * │           Сетка календаря               │      Sidebar          │
 * │                                         │   (просмотр события)  │
 * │                                         │                       │
 * └─────────────────────────────────────────┴───────────────────────┘
 * 
 * ФУНКЦИОНАЛ:
 * - URL-параметры для шаринга ссылок
 * - Двойной клик по пустому месту → создание события
 * - Двойной клик по событию → просмотр в sidebar
 * - Hover по событию → tooltip с превью
 * - Клик по минимапу → переход к дате
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Spin, message } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

// Хуки
import useCalendarFilters from './components/hooks/UseCalendarFilters';

// Компоненты
import CalendarFilters from './components/CalendarFilters';
import CalendarHeatmap from './components/CalendarHeatmap';
import CalendarNavigation from './components/CalendarNavigation';
import CalendarGrid from './components/CalendarGrid';
import CalendarSidebar from './components/CalendarSidebar';
import EventCreateModal from './components/EventCreateModal';

// Моки и утилиты
import {
  fetchCalendarEvents,
  fetchUsers,
  groupEventsByDate,
  generateHeatmapData,
  MOCK_ORGANIZATIONS, EVENT_TYPES, MOCK_USERS,
} from './components/mock/CALENDARMOCK';

// Стили
import './components/style/calendarpage.css';
import {CSRF_TOKEN, PRODMODE, ROUTE_PREFIX} from '../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import { OM_ORG_FILTERDATA } from '../ORG_LIST/components/mock/ORGLISTMOCK';

// Устанавливаем русскую локаль
dayjs.locale('ru');

const CalendarPage = ({ userdata }) => {
  // ==================== СОСТОЯНИЕ ====================
  
  // Загрузка
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Данные
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [heatmapData, setHeatmapData] = useState({});
  const [eventsTypes, setEventsTypes] = useState([])
  
  // UI состояние
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createModalDate, setCreateModalDate] = useState(null);

  const [baseFilters, setBaseFilters] = useState([]);
  const [baseCompanies, setBaseCompanies] = useState([]);
  
  // Фильтры (с URL синхронизацией - для выборки айтемов)
  const filters = useCalendarFilters(userdata);
  
  // ==================== ЗАГРУЗКА ДАННЫХ ====================
  
  useEffect(() => {
    fetchEvents(filters.apiFilters).then(r => setLoading(false));
  }, [filters.apiFilters]);

  const fetchSelects = async () => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/calendar/getselects`, {
          _token: CSRF_TOKEN,
        });

        let content = response.data.content;
        setUsers(content.users);
        setEventsTypes(content.types);
        // setBaseCompanies(content.companies);
      } catch (e) {
        console.log(e);
      } finally {
      }
    } else {
      const usersMock = await fetchUsers(filters.companyId);
      setUsers(usersMock);
      setEventsTypes(EVENT_TYPES);
    }
  }

  const fetchEvents = async (filters) => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/calendar/events`, {
          data: {
            filters: filters
          },
          _token: CSRF_TOKEN,
        });

        setEvents(response.data.content);

      } catch (e) {
        console.log(e);
      }
    } else {
      const data = await fetchCalendarEvents(filters);
      setEvents(data);
    }
  }

  useEffect(() => {
    fetchSelects().then(r => setUsersLoading(false));
  }, []);

  // Загрузка пользователей при смене филиала
  // useEffect(() => {
  //   const loadUsers = async () => {
  //     setUsersLoading(true);
  //     try {
  //       const data = await fetchUsers(filters.companyId);
  //       setUsers(data);
  //     } catch (error) {
  //       console.error('Ошибка загрузки пользователей:', error);
  //       message.error('Не удалось загрузить список сотрудников');
  //     } finally {
  //       setUsersLoading(false);
  //     }
  //   };
  //
  //   loadUsers();
  // }, [filters.companyId]);


  // Загрузка событий при изменении фильтров
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      if (PRODMODE){

        try {
          const data = await fetchEvents(filters.apiFilters);
          if (data){
            setEvents(data);
          }
        } catch (error) {
          console.error('Ошибка загрузки событий:', error);
          message.error('Не удалось загрузить события');
        } finally {
          setLoading(false);
        }
      } else {
        const data = await fetchCalendarEvents(filters.apiFilters);
        setEvents(data);
      }
    };

    loadEvents();
  }, [filters.apiFilters]);

  // Загрузка данных для heatmap (за текущий год)
  useEffect(() => {
    const loadHeatmapData = async () => {
      try {
        // Загружаем события за весь год для heatmap
        const yearFilters = {
          ...filters.apiFilters,
          dateFrom: dayjs().startOf('year').format('YYYY-MM-DD'),
          dateTo: dayjs().endOf('year').format('YYYY-MM-DD'),
        };
        // const yearEvents = await fetchCalendarEvents(yearFilters);

        const yearEvents = await fetchEvents(filters.apiFilters);
        const heatmap = generateHeatmapData(yearEvents, dayjs().year());
        setHeatmapData(heatmap);
      } catch (error) {
        console.error('Ошибка загрузки heatmap:', error);
      }
    };
    
    loadHeatmapData();
  }, [filters.companyId, filters.userIds, filters.types]);

  // ==================== ГРУППИРОВКА СОБЫТИЙ ====================
  
  const eventsByDate = useMemo(() => {
    return groupEventsByDate(events);
  }, [events]);

  // ==================== ОБРАБОТЧИКИ ====================
  
  // Клик по событию → открыть sidebar
  const handleEventClick = useCallback((event) => {
    setSelectedEvent(event);
    setSidebarVisible(true);
  }, []);

  // Двойной клик по пустому месту → создать событие
  const handleDateDoubleClick = useCallback((date) => {
    setCreateModalDate(dayjs(date));
    setCreateModalVisible(true);
  }, []);

  // Клик по дню в heatmap → перейти к дате
  const handleHeatmapClick = useCallback((date) => {
    filters.goToDate(date);
  }, [filters]);

  // Закрытие sidebar
  const handleSidebarClose = useCallback(() => {
    setSidebarVisible(false);
    setSelectedEvent(null);
  }, []);

  // Создание события
  // const handleEventCreate = useCallback(async (eventData) => {
  //   try {
  //     // TODO: Реальное создание через API
  //     message.success('Событие создано');
  //     setCreateModalVisible(false);
      
  //     // Перезагружаем события
  //     const data = await fetchCalendarEvents(filters.apiFilters);
  //     setEvents(data);
  //   } catch (error) {
  //     console.error('Ошибка создания события:', error);
  //     message.error('Не удалось создать событие');
  //   }
  // }, [filters.apiFilters]);

  // Добавление комментария
  const handleCommentAdd = useCallback(async (eventId, content) => {
    try {
      // TODO: Реальное добавление через API
      message.success('Комментарий добавлен');
      
      // Обновляем выбранное событие
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(prev => ({
          ...prev,
          comments_count: (prev.comments_count || 0) + 1,
        }));
      }
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      message.error('Не удалось добавить комментарий');
    }
  }, [selectedEvent]);

  // ==================== РЕНДЕР ====================


  // Get filler's data for selects
// const get_org_filters = async () => {
//   if (PRODMODE) {
//     try {
//       let response = await PROD_AXIOS_INSTANCE.post('api/sales/orgfilterlist', {
//         data: {},
//         _token: CSRF_TOKEN,
//       });
//       setBaseFilters(response.data.filters);
//       setBaseCompanies(response.data.filters?.companies);
//     } catch (e) {
//       console.log(e);
//     } finally {
//     }
//   } else {
//   }
// };

  
  // Филиалы из userdata (исключаем служебный id=1)
  const companies = useMemo(() => {
    return (userdata?.companies || []).filter(c => c.id !== 1);
  }, [userdata]);

  return (
    <div className="calendar-page">
      {/* Заголовок */}
      <div className="calendar-page-header">
        <h1 className="calendar-page-title">📅 Календарь событий</h1>
      </div>

      {/* Фильтры */}
      <CalendarFilters
        companyId={filters.companyId}
        userIds={filters.userIds}
        types={filters.types}
        hasComments={filters.hasComments}
        onCompanyChange={filters.setCompanyId}
        onUsersChange={filters.setUserIds}
        onTypesChange={filters.setTypes}
        onHasCommentsChange={filters.setHasComments}
        companies={companies}
        users={users}
        usersLoading={usersLoading}
        currentUserId={filters.currentUserId}
        isAdmin={filters.isAdmin}
        event_types={eventsTypes}
        // myCompanyId={userdata.user.id_company}
      />

      {/* Минимап (Heatmap) */}
      <CalendarHeatmap
        data={heatmapData}
        year={dayjs().year()}
        selectedDate={filters.selectedDate}
        onDateClick={handleHeatmapClick}
      />

      {/* Навигация */}
      <CalendarNavigation
        viewMode={filters.viewMode}
        periodTitle={filters.periodTitle}
        onViewModeChange={filters.setViewMode}
        onPrev={filters.goToPrev}
        onNext={filters.goToNext}
        onToday={filters.goToToday}
      />

      {/* Основной контент */}
      <div className="calendar-page-content">
        {/* Сетка календаря */}
        <div className={`calendar-grid-wrapper ${sidebarVisible ? 'with-sidebar' : ''}`}>
          <Spin spinning={loading}>
            <CalendarGrid
              viewMode={filters.viewMode}
              selectedDate={filters.selectedDate}
              dateRange={filters.dateRange}
              eventsByDate={eventsByDate}
              onEventClick={handleEventClick}
              onDateDoubleClick={handleDateDoubleClick}
              onDateSelect={filters.goToDate}
            />
          </Spin>
        </div>

        {/* Sidebar */}
        <CalendarSidebar
          visible={sidebarVisible}
          event={selectedEvent}
          onClose={handleSidebarClose}
          onCommentAdd={handleCommentAdd}
          currentUserId={filters.currentUserId}
          userdata={userdata}
          companies={baseCompanies}
          selects={baseFilters}
        />
      </div>

      {/* Модалка создания события */}
      {/*<EventCreateModal*/}
      {/*  visible={createModalVisible}*/}
      {/*  date={createModalDate}*/}
      {/*  onCancel={() => setCreateModalVisible(false)}*/}
      {/*  onCreate={handleEventCreate}*/}
      {/*  organizations={MOCK_ORGANIZATIONS.filter(o => o.id_company === filters.companyId)}*/}
      {/*  userdata={userdata}*/}
      {/*  companies={baseCompanies}*/}
      {/*  selects={baseFilters}*/}
      {/*/>*/}
    </div>
  );
};

export default CalendarPage;
