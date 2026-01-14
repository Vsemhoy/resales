/**
 * ReportsNavigation.jsx
 * 
 * Навигация по периодам для отчётов
 * 
 * ◀ Q4 2025 ▶   (01.10.2025 - 31.12.2025)   [Текущий период]
 */

import React from 'react';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const ReportsNavigation = ({
  periodTitle,
  dateRange,
  onPrev,
  onNext,
  onCurrent,
}) => {
  
  // Форматирование диапазона дат
  const dateRangeText = `${dateRange.start.format('DD.MM.YYYY')} — ${dateRange.end.format('DD.MM.YYYY')}`;

  return (
    <div className="reports-navigation">
      {/* Навигация по периоду */}
      <div className="reports-nav-period">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={onPrev}
          className="reports-nav-arrow"
        />
        
        <div className="reports-nav-title-wrapper">
          <span className="reports-nav-title">
            {periodTitle}
          </span>
          <span className="reports-nav-dates">
            {dateRangeText}
          </span>
        </div>
        
        <Button
          type="text"
          icon={<RightOutlined />}
          onClick={onNext}
          className="reports-nav-arrow"
        />
      </div>

      {/* Кнопка "Текущий период" */}
      <div className="reports-nav-current">
        <Button onClick={onCurrent}>
          Текущий период
        </Button>
      </div>
    </div>
  );
};

export default ReportsNavigation;
