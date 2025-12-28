/**
 * ReportsPage.jsx
 * 
 * Страница отчётов по активности сотрудников
 * 
 * СТРУКТУРА:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Заголовок                                                       │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ Фильтры: период, филиал, отдел, сотрудники, типы, скрыть пустые │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ Навигация по периоду:     ◀ Q4 2025 ▶        [Текущий период]   │
 * ├─────────────────────────────────────────────────────┬───────────┤
 * │                                                     │           │
 * │  Таблица с метриками                                │  Sidebar  │
 * │  ───────────────────────────────────────────────    │           │
 * │  Сотрудник | КП | Счёт | Звонок | ... | Σ | [▶]    │           │
 * │  ───────────────────────────────────────────────    │           │
 * │  Иванов    | 12 |  8   |   45   | ... | 85| [▶]    │           │
 * │    └─ Детализация...                                │           │
 * │  ───────────────────────────────────────────────    │           │
 * │  ИТОГО     | 35 |  25  |  144   | ... |264| [▶]    │           │
 * │                                                     │           │
 * └─────────────────────────────────────────────────────┴───────────┘
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Spin, message } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

// Хуки
import useReportsFilters from './components/hooks/useReportFilters';

// Компоненты
import ReportsFilters from './components/ReportsFilters';
import ReportsNavigation from './components/ReportsNavigation';
import ReportsTable from './components/ReportsTable';

// Переиспользуем Sidebar из календаря
import CalendarSidebar from '../CALENDAR2/components/CalendarSidebar';

// Моки и утилиты
import {
  fetchCalendarEvents,
  fetchUsers,
  fetchReportData,
  MOCK_DEPARTMENTS,
  REPORT_EVENT_TYPES,
} from '../CALENDAR2/components/mock/CALENDARMOCK';

// Стили
import './components/style/reportspage.css';

// Плагины dayjs
dayjs.extend(quarterOfYear);
dayjs.locale('ru');

const ReportsPage = ({ userdata }) => {
  // ==================== СОСТОЯНИЕ ====================
  
  // Загрузка
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Данные
  const [users, setUsers] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [totals, setTotals] = useState({});
  
  // Детализация
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [detailEvents, setDetailEvents] = useState([]);
  
  // Sidebar
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Фильтры (с URL синхронизацией)
  const filters = useReportsFilters(userdata);

  // ==================== ЗАГРУЗКА ДАННЫХ ====================
  
  // Загрузка пользователей при смене филиала
  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const data = await fetchUsers(filters.companyId);
        setUsers(data);
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        message.error('Не удалось загрузить список сотрудников');
      } finally {
        setUsersLoading(false);
      }
    };
    
    loadUsers();
  }, [filters.companyId]);

  // Загрузка данных отчёта
  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      try {
        const result = await fetchReportData(filters.apiFilters);
        setReportData(result.tableData);
        setTotals(result.totals);
      } catch (error) {
        console.error('Ошибка загрузки отчёта:', error);
        message.error('Не удалось загрузить данные отчёта');
      } finally {
        setLoading(false);
      }
    };
    
    loadReportData();
  }, [filters.apiFilters]);

  // ==================== ФИЛЬТРАЦИЯ И СОРТИРОВКА ====================
  
  // Фильтруем пользователей по отделу
  const filteredUsers = useMemo(() => {
    if (!filters.departmentId) return users;
    return users.filter(u => u.department_id === filters.departmentId);
  }, [users, filters.departmentId]);

  // Фильтруем данные отчёта
  const filteredReportData = useMemo(() => {
    let data = [...reportData];
    
    // Фильтр по выбранным пользователям
    if (filters.userIds.length > 0) {
      data = data.filter(row => filters.userIds.includes(row.user_id));
    }
    
    // Фильтр по отделу
    if (filters.departmentId) {
      data = data.filter(row => row.department_id === filters.departmentId);
    }
    
    // Скрыть пустые
    if (filters.hideEmpty) {
      data = data.filter(row => row.total > 0);
    }
    
    // Сортировка
    data.sort((a, b) => {
      let aVal = a[filters.sortField];
      let bVal = b[filters.sortField];
      
      // Для строк
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    return data;
  }, [reportData, filters.userIds, filters.departmentId, filters.hideEmpty, filters.sortField, filters.sortOrder]);

  // Пересчёт итогов для отфильтрованных данных
  const filteredTotals = useMemo(() => {
    const result = { user_name: 'ИТОГО', total: 0 };
    
    REPORT_EVENT_TYPES.forEach(type => {
      result[`type_${type.id}`] = 0;
    });
    
    filteredReportData.forEach(row => {
      result.total += row.total || 0;
      REPORT_EVENT_TYPES.forEach(type => {
        result[`type_${type.id}`] += row[`type_${type.id}`] || 0;
      });
    });
    
    return result;
  }, [filteredReportData]);

  // ==================== ОБРАБОТЧИКИ ====================
  
  // Раскрытие детализации по сотруднику
  const handleExpandUser = useCallback(async (userId) => {
    // Если уже раскрыт - закрываем
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setDetailEvents([]);
      return;
    }
    
    setExpandedUserId(userId);
    setDetailLoading(true);
    
    try {
      const events = await fetchCalendarEvents({
        ...filters.apiFilters,
        userIds: userId === 'all' ? filters.userIds : [userId],
      });
      setDetailEvents(events);
    } catch (error) {
      console.error('Ошибка загрузки детализации:', error);
      message.error('Не удалось загрузить детализацию');
    } finally {
      setDetailLoading(false);
    }
  }, [expandedUserId, filters.apiFilters, filters.userIds]);

  // Клик по событию в детализации
  const handleEventClick = useCallback((event) => {
    setSelectedEvent(event);
    setSidebarVisible(true);
  }, []);

  // Закрытие sidebar
  const handleSidebarClose = useCallback(() => {
    setSidebarVisible(false);
    setSelectedEvent(null);
  }, []);

  // Добавление комментария
  const handleCommentAdd = useCallback(async (eventId, content) => {
    try {
      message.success('Комментарий добавлен');
      
      // Обновляем событие в детализации
      setDetailEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, comments_count: (e.comments_count || 0) + 1 }
          : e
      ));
      
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
  
  // Филиалы из userdata
  const companies = useMemo(() => {
    return (userdata?.companies || []).filter(c => c.id !== 1);
  }, [userdata]);

  // Активные типы для колонок (либо выбранные, либо все для отчётов)
  const activeTypes = useMemo(() => {
    if (filters.types.length > 0) {
      return REPORT_EVENT_TYPES.filter(t => filters.types.includes(t.id));
    }
    return REPORT_EVENT_TYPES;
  }, [filters.types]);

  return (
    <div className="reports-page">
      {/* Заголовок */}
      <div className="reports-page-header">
        <h1 className="reports-page-title">📊 Отчёты по активности</h1>
      </div>

      {/* Фильтры */}
      <ReportsFilters
        period={filters.period}
        companyId={filters.companyId}
        departmentId={filters.departmentId}
        userIds={filters.userIds}
        types={filters.types}
        hideEmpty={filters.hideEmpty}
        onPeriodChange={filters.setPeriod}
        onCompanyChange={filters.setCompanyId}
        onDepartmentChange={filters.setDepartmentId}
        onUsersChange={filters.setUserIds}
        onTypesChange={filters.setTypes}
        onHideEmptyChange={filters.setHideEmpty}
        companies={companies}
        departments={MOCK_DEPARTMENTS}
        users={filteredUsers}
        usersLoading={usersLoading}
        isAdmin={filters.isAdmin}
      />

      {/* Навигация по периоду */}
      <ReportsNavigation
        periodTitle={filters.periodTitle}
        dateRange={filters.dateRange}
        onPrev={filters.goToPrev}
        onNext={filters.goToNext}
        onCurrent={filters.goToCurrent}
      />

      {/* Основной контент */}
      <div className="reports-page-content">
        {/* Таблица */}
        <div className={`reports-table-wrapper ${sidebarVisible ? 'with-sidebar' : ''}`}>
          <Spin spinning={loading}>
            <ReportsTable
              data={filteredReportData}
              totals={filteredTotals}
              activeTypes={activeTypes}
              sortField={filters.sortField}
              sortOrder={filters.sortOrder}
              onSort={filters.handleSort}
              expandedUserId={expandedUserId}
              onExpandUser={handleExpandUser}
              detailEvents={detailEvents}
              detailLoading={detailLoading}
              onEventClick={handleEventClick}
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
        />
      </div>
    </div>
  );
};

export default ReportsPage;
