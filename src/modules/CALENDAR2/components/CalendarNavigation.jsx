/**
 * CalendarNavigation.jsx
 * 
 * Навигация по календарю
 * 
 * [День][Неделя][Месяц][Квартал]     ◀ Декабрь 2025 ▶   [Сегодня]
 */

import React from 'react';
import { Button, DatePicker, Segmented } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { VIEW_MODES, VIEW_MODE_LABELS } from './hooks/UseCalendarFilters';

const CalendarNavigation = ({
  viewMode,
  periodTitle,
  selectedDate,
  onViewModeChange,
  onDateChange,
  onPrev,
  onNext,
  onToday,
}) => {
  
  // Опции для Segmented
  const viewOptions = [
    { value: VIEW_MODES.DAY, label: VIEW_MODE_LABELS[VIEW_MODES.DAY] },
    { value: VIEW_MODES.WEEK, label: VIEW_MODE_LABELS[VIEW_MODES.WEEK] },
    { value: VIEW_MODES.MONTH, label: VIEW_MODE_LABELS[VIEW_MODES.MONTH] },
    // { value: VIEW_MODES.QUARTER, label: VIEW_MODE_LABELS[VIEW_MODES.QUARTER] },
  ];

  const pickerByViewMode = {
    [VIEW_MODES.DAY]: 'date',
    [VIEW_MODES.WEEK]: 'week',
    [VIEW_MODES.MONTH]: 'month',
    [VIEW_MODES.QUARTER]: 'quarter',
  };

  const handleDateChange = (date) => {
    if (date) {
      onDateChange(date);
    }
  };

  return (
    <div className="calendar-navigation">
      {/* Переключатель режима */}
      <div className="calendar-nav-modes">
        <Segmented
          value={viewMode}
          onChange={onViewModeChange}
          options={viewOptions}
        />
      </div>

      {/* Навигация по периоду */}
      <div className="calendar-nav-period">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={onPrev}
          className="calendar-nav-arrow"
        />
        
        <DatePicker
          key={viewMode}
          className="calendar-nav-datepicker"
          value={selectedDate}
          picker={pickerByViewMode[viewMode]}
          format={() => periodTitle}
          allowClear={false}
          inputReadOnly
          placeholder={periodTitle}
          onChange={handleDateChange}
        />
        
        <Button
          type="text"
          icon={<RightOutlined />}
          onClick={onNext}
          className="calendar-nav-arrow"
        />
      </div>

      {/* Кнопка "Сегодня" */}
      <div className="calendar-nav-today">
        <Button onClick={onToday}>
          Сегодня
        </Button>
      </div>
    </div>
  );
};

export default CalendarNavigation;
