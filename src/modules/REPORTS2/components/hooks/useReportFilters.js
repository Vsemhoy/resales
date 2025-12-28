/**
 * useReportsFilters.js
 * 
 * Хук для управления фильтрами страницы отчётов
 * Синхронизирует состояние фильтров с URL-параметрами
 * 
 * URL параметры:
 * - period: месяц/квартал/полгода/год (month/quarter/half/year)
 * - date: начальная дата периода (YYYY-MM-DD)
 * - company: ID филиала
 * - department: ID отдела
 * - users: ID пользователей через запятую
 * - types: ID типов событий через запятую
 * - hideEmpty: скрыть пустые строки (1/0)
 * - sort: поле сортировки
 * - order: направление сортировки (asc/desc)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(quarterOfYear);

// Варианты периодов
export const PERIOD_TYPES = {
  MONTH: 'month',
  QUARTER: 'quarter',
  HALF: 'half',
  YEAR: 'year',
};

// Лейблы для периодов
export const PERIOD_LABELS = {
  [PERIOD_TYPES.MONTH]: 'Месяц',
  [PERIOD_TYPES.QUARTER]: 'Квартал',
  [PERIOD_TYPES.HALF]: 'Полгода',
  [PERIOD_TYPES.YEAR]: 'Год',
};

/**
 * Хук для управления фильтрами отчётов
 * @param {Object} userdata - Данные текущего пользователя
 * @returns {Object} Состояние фильтров и методы управления
 */
const useReportsFilters = (userdata) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Дефолтный филиал из userdata
  const defaultCompanyId = userdata?.user?.id_company || 2;
  const currentUserId = userdata?.user?.id;
  const isAdmin = userdata?.user?.is_admin || userdata?.user?.super;

  // ==================== ПАРСИНГ URL ПАРАМЕТРОВ ====================
  
  // Период
  const periodFromUrl = searchParams.get('period');
  const initialPeriod = Object.values(PERIOD_TYPES).includes(periodFromUrl)
    ? periodFromUrl
    : PERIOD_TYPES.QUARTER;

  // Дата периода
  const dateFromUrl = searchParams.get('date');
  const initialDate = dateFromUrl && dayjs(dateFromUrl).isValid()
    ? dayjs(dateFromUrl)
    : dayjs();

  // Филиал
  const companyIdFromUrl = searchParams.get('company');
  const initialCompanyId = companyIdFromUrl
    ? parseInt(companyIdFromUrl, 10)
    : defaultCompanyId;

  // Отдел
  const departmentIdFromUrl = searchParams.get('department');
  const initialDepartmentId = departmentIdFromUrl
    ? parseInt(departmentIdFromUrl, 10)
    : null;

  // Пользователи (по умолчанию - все в филиале)
  const usersFromUrl = searchParams.get('users');
  const initialUserIds = usersFromUrl
    ? usersFromUrl.split(',').map(id => parseInt(id, 10)).filter(Boolean)
    : [];

  // Типы событий (по умолчанию - все для отчётов)
  const typesFromUrl = searchParams.get('types');
  const initialTypes = typesFromUrl
    ? typesFromUrl.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    : [];

  // Скрыть пустые
  const hideEmptyFromUrl = searchParams.get('hideEmpty');
  const initialHideEmpty = hideEmptyFromUrl === '1';

  // Сортировка
  const sortFromUrl = searchParams.get('sort');
  const initialSort = sortFromUrl || 'user_name';
  
  const orderFromUrl = searchParams.get('order');
  const initialOrder = orderFromUrl === 'asc' ? 'asc' : 'desc';

  // ==================== СОСТОЯНИЕ ====================

  const [period, setPeriod] = useState(initialPeriod);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [departmentId, setDepartmentId] = useState(initialDepartmentId);
  const [userIds, setUserIds] = useState(initialUserIds);
  const [types, setTypes] = useState(initialTypes);
  const [hideEmpty, setHideEmpty] = useState(initialHideEmpty);
  const [sortField, setSortField] = useState(initialSort);
  const [sortOrder, setSortOrder] = useState(initialOrder);

  // ==================== СИНХРОНИЗАЦИЯ С URL ====================

  useEffect(() => {
    const params = new URLSearchParams();
    
    // Период (не пишем если квартал - дефолт)
    if (period !== PERIOD_TYPES.QUARTER) {
      params.set('period', period);
    }
    
    // Дата (не пишем если текущий период)
    const isCurrentPeriod = isInCurrentPeriod(selectedDate, period);
    if (!isCurrentPeriod) {
      params.set('date', selectedDate.format('YYYY-MM-DD'));
    }
    
    // Филиал
    if (companyId !== defaultCompanyId) {
      params.set('company', String(companyId));
    }
    
    // Отдел
    if (departmentId) {
      params.set('department', String(departmentId));
    }
    
    // Пользователи (не пишем если все)
    if (userIds.length > 0) {
      params.set('users', userIds.join(','));
    }
    
    // Типы (не пишем если все)
    if (types.length > 0) {
      params.set('types', types.join(','));
    }
    
    // Скрыть пустые
    if (hideEmpty) {
      params.set('hideEmpty', '1');
    }
    
    // Сортировка (не пишем если дефолт)
    if (sortField !== 'user_name') {
      params.set('sort', sortField);
    }
    if (sortOrder !== 'desc') {
      params.set('order', sortOrder);
    }
    
    setSearchParams(params, { replace: true });
  }, [period, selectedDate, companyId, departmentId, userIds, types, hideEmpty, sortField, sortOrder, defaultCompanyId, setSearchParams]);

  // ==================== ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ ====================

  // Диапазон дат для текущего периода
  const dateRange = useMemo(() => {
    let start, end;
    
    switch (period) {
      case PERIOD_TYPES.MONTH:
        start = selectedDate.startOf('month');
        end = selectedDate.endOf('month');
        break;
        
      case PERIOD_TYPES.QUARTER:
        start = selectedDate.startOf('quarter');
        end = selectedDate.endOf('quarter');
        break;
        
      case PERIOD_TYPES.HALF:
        const halfStart = selectedDate.month() < 6 ? 0 : 6;
        start = selectedDate.month(halfStart).startOf('month');
        end = start.add(5, 'month').endOf('month');
        break;
        
      case PERIOD_TYPES.YEAR:
        start = selectedDate.startOf('year');
        end = selectedDate.endOf('year');
        break;
        
      default:
        start = selectedDate.startOf('quarter');
        end = selectedDate.endOf('quarter');
    }
    
    return {
      start,
      end,
      startStr: start.format('YYYY-MM-DD'),
      endStr: end.format('YYYY-MM-DD'),
    };
  }, [period, selectedDate]);

  // Заголовок периода
  const periodTitle = useMemo(() => {
    switch (period) {
      case PERIOD_TYPES.MONTH:
        return selectedDate.format('MMMM YYYY');
        
      case PERIOD_TYPES.QUARTER:
        const quarter = selectedDate.quarter();
        return `Q${quarter} ${selectedDate.year()}`;
        
      case PERIOD_TYPES.HALF:
        const half = selectedDate.month() < 6 ? 1 : 2;
        return `${half}-е полугодие ${selectedDate.year()}`;
        
      case PERIOD_TYPES.YEAR:
        return `${selectedDate.year()} год`;
        
      default:
        return selectedDate.format('YYYY');
    }
  }, [period, selectedDate]);

  // Фильтры для API запроса
  const apiFilters = useMemo(() => ({
    companyId,
    departmentId,
    userIds,
    types,
    dateFrom: dateRange.startStr,
    dateTo: dateRange.endStr,
    currentUserId,
  }), [companyId, departmentId, userIds, types, dateRange, currentUserId]);

  // ==================== МЕТОДЫ ====================

  // Навигация по периодам
  const goToPrev = useCallback(() => {
    switch (period) {
      case PERIOD_TYPES.MONTH:
        setSelectedDate(prev => prev.subtract(1, 'month'));
        break;
      case PERIOD_TYPES.QUARTER:
        setSelectedDate(prev => prev.subtract(3, 'month'));
        break;
      case PERIOD_TYPES.HALF:
        setSelectedDate(prev => prev.subtract(6, 'month'));
        break;
      case PERIOD_TYPES.YEAR:
        setSelectedDate(prev => prev.subtract(1, 'year'));
        break;
    }
  }, [period]);

  const goToNext = useCallback(() => {
    switch (period) {
      case PERIOD_TYPES.MONTH:
        setSelectedDate(prev => prev.add(1, 'month'));
        break;
      case PERIOD_TYPES.QUARTER:
        setSelectedDate(prev => prev.add(3, 'month'));
        break;
      case PERIOD_TYPES.HALF:
        setSelectedDate(prev => prev.add(6, 'month'));
        break;
      case PERIOD_TYPES.YEAR:
        setSelectedDate(prev => prev.add(1, 'year'));
        break;
    }
  }, [period]);

  const goToCurrent = useCallback(() => {
    setSelectedDate(dayjs());
  }, []);

  // Сортировка
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }, [sortField]);

  // Сброс фильтров
  const resetFilters = useCallback(() => {
    setPeriod(PERIOD_TYPES.QUARTER);
    setSelectedDate(dayjs());
    setCompanyId(defaultCompanyId);
    setDepartmentId(null);
    setUserIds([]);
    setTypes([]);
    setHideEmpty(false);
    setSortField('user_name');
    setSortOrder('desc');
  }, [defaultCompanyId]);

  // ==================== ВОЗВРАТ ====================

  return {
    // Состояние
    period,
    selectedDate,
    companyId,
    departmentId,
    userIds,
    types,
    hideEmpty,
    sortField,
    sortOrder,
    
    // Сеттеры
    setPeriod,
    setSelectedDate,
    setCompanyId,
    setDepartmentId,
    setUserIds,
    setTypes,
    setHideEmpty,
    
    // Вычисляемые
    dateRange,
    periodTitle,
    apiFilters,
    
    // Навигация и сортировка
    goToPrev,
    goToNext,
    goToCurrent,
    handleSort,
    resetFilters,
    
    // Мета
    currentUserId,
    isAdmin,
    defaultCompanyId,
  };
};

// Хелпер: проверка, находится ли дата в текущем периоде
const isInCurrentPeriod = (date, period) => {
  const now = dayjs();
  
  switch (period) {
    case PERIOD_TYPES.MONTH:
      return date.isSame(now, 'month');
    case PERIOD_TYPES.QUARTER:
      return date.quarter() === now.quarter() && date.year() === now.year();
    case PERIOD_TYPES.HALF:
      const dateHalf = date.month() < 6 ? 1 : 2;
      const nowHalf = now.month() < 6 ? 1 : 2;
      return dateHalf === nowHalf && date.year() === now.year();
    case PERIOD_TYPES.YEAR:
      return date.year() === now.year();
    default:
      return false;
  }
};

export default useReportsFilters;
