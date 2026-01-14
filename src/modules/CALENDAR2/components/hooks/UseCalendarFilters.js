/**
 * useCalendarFilters.js
 * 
 * Хук для управления фильтрами календаря
 * Синхронизирует состояние фильтров с URL-параметрами
 * 
 * URL параметры:
 * - company: ID филиала
 * - users: ID пользователей через запятую
 * - types: ID типов событий через запятую
 * - view: день/неделя/месяц/квартал (day/week/month/quarter)
 * - date: выбранная дата (YYYY-MM-DD)
 * - comments: только с комментариями (1/0)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

// Варианты отображения календаря
export const VIEW_MODES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
};

// Лейблы для режимов
export const VIEW_MODE_LABELS = {
  [VIEW_MODES.DAY]: 'День',
  [VIEW_MODES.WEEK]: 'Неделя',
  [VIEW_MODES.MONTH]: 'Месяц',
  // [VIEW_MODES.QUARTER]: 'Квартал',
};

/**
 * Хук для управления фильтрами календаря
 * @param {Object} userdata - Данные текущего пользователя
 * @returns {Object} Состояние фильтров и методы управления
 */
const useCalendarFilters = (userdata) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Дефолтный филиал из userdata
  const defaultCompanyId = userdata?.user?.active_company || 2;
  const currentUserId = userdata?.user?.id;
  const isAdmin = userdata?.user?.is_admin || userdata?.user?.super;

  console.log("defaultCompanyId:" + defaultCompanyId)
  // ==================== ПАРСИНГ URL ПАРАМЕТРОВ ====================
  
  // Филиал
  const companyIdFromUrl = searchParams.get('company');
  const initialCompanyId = companyIdFromUrl 
    ? parseInt(companyIdFromUrl, 10) 
    : defaultCompanyId;

  // Пользователи (по умолчанию - текущий)
  const usersFromUrl = searchParams.get('users');
  const initialUserIds = usersFromUrl 
    ? usersFromUrl.split(',').map(id => parseInt(id, 10)).filter(Boolean)
    : currentUserId ? [currentUserId] : [];

  // Типы событий (по умолчанию - все, id=0)
  const typesFromUrl = searchParams.get('types');
  const initialTypes = typesFromUrl
    ? typesFromUrl.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    : [0];

  // Режим отображения
  const viewFromUrl = searchParams.get('view');
  const initialView = Object.values(VIEW_MODES).includes(viewFromUrl) 
    ? viewFromUrl 
    : VIEW_MODES.MONTH;

  // Выбранная дата
  const dateFromUrl = searchParams.get('date');
  const initialDate = dateFromUrl && dayjs(dateFromUrl).isValid()
    ? dayjs(dateFromUrl)
    : dayjs();

  // Только с комментариями
  const commentsFromUrl = searchParams.get('comments');
  const initialHasComments = commentsFromUrl === '1';

  // ==================== СОСТОЯНИЕ ====================

  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [userIds, setUserIds] = useState(initialUserIds);
  const [types, setTypes] = useState(initialTypes);
  const [viewMode, setViewMode] = useState(initialView);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [hasComments, setHasComments] = useState(initialHasComments);

  // ==================== СИНХРОНИЗАЦИЯ С URL ====================

  // Обновление URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Филиал (не пишем если совпадает с дефолтным)
    if (companyId !== defaultCompanyId) {
      params.set('company', String(companyId));
    }
    
    // Пользователи (не пишем если только текущий)
    const isOnlyCurrentUser = userIds.length === 1 && userIds[0] === currentUserId;
    if (!isOnlyCurrentUser && userIds.length > 0) {
      params.set('users', userIds.join(','));
    }
    
    // Типы (не пишем если "Все")
    if (types.length > 0 && !(types.length === 1 && types[0] === 0)) {
      params.set('types', types.join(','));
    }
    
    // Режим (не пишем если месяц - дефолт)
    if (viewMode !== VIEW_MODES.MONTH) {
      params.set('view', viewMode);
    }
    
    // Дата (не пишем если сегодня)
    const isToday = selectedDate.isSame(dayjs(), 'day');
    if (!isToday) {
      params.set('date', selectedDate.format('YYYY-MM-DD'));
    }
    
    // Комментарии
    if (hasComments) {
      params.set('comments', '1');
    }
    
    setSearchParams(params, { replace: true });
  }, [companyId, userIds, types, viewMode, selectedDate, hasComments, defaultCompanyId, currentUserId, setSearchParams]);

  // ==================== ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ ====================

  // Диапазон дат для текущего режима
  const dateRange = useMemo(() => {
    let start, end;
    
    switch (viewMode) {
      case VIEW_MODES.DAY:
        start = selectedDate.startOf('day');
        end = selectedDate.endOf('day');
        break;
        
      case VIEW_MODES.WEEK:
        start = selectedDate.startOf('week');
        end = selectedDate.endOf('week');
        break;
        
      case VIEW_MODES.MONTH:
        start = selectedDate.startOf('month');
        end = selectedDate.endOf('month');
        break;
        
      case VIEW_MODES.QUARTER:
        const quarterStart = Math.floor(selectedDate.month() / 3) * 3;
        start = selectedDate.month(quarterStart).startOf('month');
        end = start.add(2, 'month').endOf('month');
        break;
        
      default:
        start = selectedDate.startOf('month');
        end = selectedDate.endOf('month');
    }
    
    return {
      start,
      end,
      startStr: start.format('YYYY-MM-DD'),
      endStr: end.format('YYYY-MM-DD'),
    };
  }, [viewMode, selectedDate]);

  // Заголовок периода
  const periodTitle = useMemo(() => {
    switch (viewMode) {
      case VIEW_MODES.DAY:
        return selectedDate.format('D MMMM YYYY');
        
      case VIEW_MODES.WEEK:
        const weekStart = selectedDate.startOf('week');
        const weekEnd = selectedDate.endOf('week');
        if (weekStart.month() === weekEnd.month()) {
          return `${weekStart.format('D')} - ${weekEnd.format('D MMMM YYYY')}`;
        }
        return `${weekStart.format('D MMM')} - ${weekEnd.format('D MMM YYYY')}`;
        
      case VIEW_MODES.MONTH:
        return selectedDate.format('MMMM YYYY');
        
      case VIEW_MODES.QUARTER:
        const quarter = Math.floor(selectedDate.month() / 3) + 1;
        return `Q${quarter} ${selectedDate.year()}`;
        
      default:
        return selectedDate.format('MMMM YYYY');
    }
  }, [viewMode, selectedDate]);

  // Фильтры для API запроса
  const apiFilters = useMemo(() => ({
    companyId,
    userIds,
    types: types.includes(0) ? [] : types, // Пустой массив = все типы
    dateFrom: dateRange.startStr,
    dateTo: dateRange.endStr,
    hasComments,
    currentUserId,
  }), [companyId, userIds, types, dateRange, hasComments, currentUserId]);

  // ==================== МЕТОДЫ ====================

  // Навигация по датам
  const goToToday = useCallback(() => {
    setSelectedDate(dayjs());
  }, []);

  const goToPrev = useCallback(() => {
    switch (viewMode) {
      case VIEW_MODES.DAY:
        setSelectedDate(prev => prev.subtract(1, 'day'));
        break;
      case VIEW_MODES.WEEK:
        setSelectedDate(prev => prev.subtract(1, 'week'));
        break;
      case VIEW_MODES.MONTH:
        setSelectedDate(prev => prev.subtract(1, 'month'));
        break;
      case VIEW_MODES.QUARTER:
        setSelectedDate(prev => prev.subtract(3, 'month'));
        break;
    }
  }, [viewMode]);

  const goToNext = useCallback(() => {
    switch (viewMode) {
      case VIEW_MODES.DAY:
        setSelectedDate(prev => prev.add(1, 'day'));
        break;
      case VIEW_MODES.WEEK:
        setSelectedDate(prev => prev.add(1, 'week'));
        break;
      case VIEW_MODES.MONTH:
        setSelectedDate(prev => prev.add(1, 'month'));
        break;
      case VIEW_MODES.QUARTER:
        setSelectedDate(prev => prev.add(3, 'month'));
        break;
    }
  }, [viewMode]);

  // Переход к конкретной дате (для клика по минимапу)
  const goToDate = useCallback((date) => {
    setSelectedDate(dayjs(date));
  }, []);

  // Сброс фильтров
  const resetFilters = useCallback(() => {
    setCompanyId(defaultCompanyId);
    setUserIds(currentUserId ? [currentUserId] : []);
    setTypes([0]);
    setViewMode(VIEW_MODES.MONTH);
    setSelectedDate(dayjs());
    setHasComments(false);
  }, [defaultCompanyId, currentUserId]);

  // Установка нескольких фильтров сразу
  const setFilters = useCallback((newFilters) => {
    if (newFilters.companyId !== undefined) setCompanyId(newFilters.companyId);
    if (newFilters.userIds !== undefined) setUserIds(newFilters.userIds);
    if (newFilters.types !== undefined) setTypes(newFilters.types);
    if (newFilters.viewMode !== undefined) setViewMode(newFilters.viewMode);
    if (newFilters.selectedDate !== undefined) setSelectedDate(dayjs(newFilters.selectedDate));
    if (newFilters.hasComments !== undefined) setHasComments(newFilters.hasComments);
  }, []);

  // ==================== ВОЗВРАТ ====================

  return {
    // Состояние
    companyId,
    userIds,
    types,
    viewMode,
    selectedDate,
    hasComments,
    
    // Сеттеры
    setCompanyId,
    setUserIds,
    setTypes,
    setViewMode,
    setSelectedDate,
    setHasComments,
    setFilters,
    
    // Вычисляемые
    dateRange,
    periodTitle,
    apiFilters,
    
    // Навигация
    goToToday,
    goToPrev,
    goToNext,
    goToDate,
    resetFilters,
    
    // Мета
    currentUserId,
    isAdmin,
    defaultCompanyId,
  };
};

export default useCalendarFilters;
