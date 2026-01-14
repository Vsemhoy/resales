/**
 * CalendarNavigation.jsx
 * 
 * Навигация по календарю
 * 
 * [День][Неделя][Месяц][Квартал]     ◀ Декабрь 2025 ▶   [Сегодня]
 */

import React from 'react';
import { Button, Segmented } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { VIEW_MODES, VIEW_MODE_LABELS } from './hooks/UseCalendarFilters';

const CalendarNavigation = ({
  viewMode,
  periodTitle,
  onViewModeChange,
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
        
        <span className="calendar-nav-title">
          {periodTitle}
        </span>
        
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
