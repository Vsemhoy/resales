/**
 * CalendarHeatmap.jsx
 * 
 * Минимапа активности в стиле GitHub
 * 
 * Показывает год по месяцам, интенсивность цвета = количество событий
 * При наведении показывает детали по типам
 * Клик переносит к выбранной дате в календаре
 */

import React, { useMemo, useState } from 'react';
import { Tooltip, Popover } from 'antd';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import { getEventTypeById, getHeatmapIntensity } from './mock/CALENDARMOCK';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

// Цвета интенсивности (от светлого к тёмному)
const INTENSITY_COLORS = [
  '#ebedf0', // 0 - нет событий
  '#9be9a8', // 1 - мало
  '#40c463', // 2 - средне
  '#30a14e', // 3 - много
  '#216e39', // 4 - очень много
];

// Дни недели
const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Месяцы
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const CalendarHeatmap = ({
  data,
  year,
  selectedDate,
  onDateClick,
}) => {
  const [hoveredDate, setHoveredDate] = useState(null);

  // Генерируем структуру года (52-53 недели)
  const yearStructure = useMemo(() => {
    const startOfYear = dayjs().year(year).startOf('year');
    const endOfYear = dayjs().year(year).endOf('year');
    
    const weeks = [];
    let currentDate = startOfYear.startOf('isoWeek'); // Начало первой недели
    
    while (currentDate.isBefore(endOfYear) || currentDate.isSame(endOfYear, 'day')) {
      const week = [];
      
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const date = currentDate.add(dayOfWeek, 'day');
        const dateStr = date.format('YYYY-MM-DD');
        const dayData = data[dateStr] || { count: 0, types: {} };
        const isCurrentYear = date.year() === year;
        const isToday = date.isSame(dayjs(), 'day');
        const isSelected = selectedDate && date.isSame(selectedDate, 'day');
        
        week.push({
          date: dateStr,
          dayjs: date,
          count: dayData.count,
          types: dayData.types,
          intensity: getHeatmapIntensity(dayData.count),
          isCurrentYear,
          isToday,
          isSelected,
          month: date.month(),
        });
      }
      
      weeks.push(week);
      currentDate = currentDate.add(1, 'week');
      
      // Защита от бесконечного цикла
      if (weeks.length > 54) break;
    }
    
    return weeks;
  }, [data, year, selectedDate]);

  // Позиции меток месяцев
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    
    yearStructure.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find(d => d.isCurrentYear);
      if (firstDayOfWeek && firstDayOfWeek.month !== lastMonth) {
        labels.push({
          month: firstDayOfWeek.month,
          weekIndex,
          label: MONTHS[firstDayOfWeek.month],
        });
        lastMonth = firstDayOfWeek.month;
      }
    });
    
    return labels;
  }, [yearStructure]);

  // Контент попоура с деталями
  const renderPopoverContent = (day) => {
    if (!day.count) {
      return (
        <div className="heatmap-popover-empty">
          Нет событий
        </div>
      );
    }

    const typeEntries = Object.entries(day.types);
    
    return (
      <div className="heatmap-popover-content">
        <div className="heatmap-popover-date">
          {day.dayjs.format('D MMMM YYYY')}
        </div>
        <div className="heatmap-popover-total">
          Всего событий: <strong>{day.count}</strong>
        </div>
        <div className="heatmap-popover-types">
          {typeEntries.map(([typeId, count]) => {
            const type = getEventTypeById(parseInt(typeId));
            return (
              <div key={typeId} className="heatmap-popover-type-row">
                <span 
                  className="heatmap-popover-type-dot"
                  style={{ backgroundColor: type?.color }}
                />
                <span className="heatmap-popover-type-name">{type?.name || 'Событие'}</span>
                <span className="heatmap-popover-type-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-heatmap">
      <div className="heatmap-container">
        {/* Метки дней недели */}
        <div className="heatmap-weekdays">
          {WEEK_DAYS.map((day, index) => (
            <div 
              key={day} 
              className="heatmap-weekday-label"
              style={{ 
                visibility: index % 2 === 0 ? 'visible' : 'hidden' 
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Основная сетка */}
        <div className="heatmap-grid-wrapper">
          {/* Метки месяцев */}
          <div className="heatmap-months">
            {monthLabels.map((label, index) => (
              <div 
                key={`${label.month}-${index}`}
                className="heatmap-month-label"
                style={{ 
                  left: `${label.weekIndex * 14}px`,
                }}
              >
                {label.label}
              </div>
            ))}
          </div>

          {/* Сетка дней */}
          <div className="heatmap-grid">
            {yearStructure.map((week, weekIndex) => (
              <div key={weekIndex} className="heatmap-week">
                {week.map((day, dayIndex) => (
                  <Popover
                    key={day.date}
                    content={renderPopoverContent(day)}
                    title={null}
                    trigger="hover"
                    placement="top"
                    mouseEnterDelay={0.3}
                  >
                    <div
                      className={`heatmap-day ${
                        !day.isCurrentYear ? 'heatmap-day-outside' : ''
                      } ${
                        day.isToday ? 'heatmap-day-today' : ''
                      } ${
                        day.isSelected ? 'heatmap-day-selected' : ''
                      }`}
                      style={{
                        backgroundColor: day.isCurrentYear 
                          ? INTENSITY_COLORS[day.intensity]
                          : 'transparent',
                      }}
                      onClick={() => day.isCurrentYear && onDateClick(day.date)}
                      onMouseEnter={() => setHoveredDate(day.date)}
                      onMouseLeave={() => setHoveredDate(null)}
                    />
                  </Popover>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Легенда */}
        <div className="heatmap-legend">
          <span className="heatmap-legend-label">Меньше</span>
          {INTENSITY_COLORS.map((color, index) => (
            <div
              key={index}
              className="heatmap-legend-item"
              style={{ backgroundColor: color }}
              title={getLegendTitle(index)}
            />
          ))}
          <span className="heatmap-legend-label">Больше</span>
          <span className="heatmap-legend-year">{year}</span>
        </div>
      </div>
    </div>
  );
};

// Подсказки для легенды
const getLegendTitle = (intensity) => {
  switch (intensity) {
    case 0: return 'Нет событий';
    case 1: return '1-2 события';
    case 2: return '3-5 событий';
    case 3: return '6-10 событий';
    case 4: return 'Более 10 событий';
    default: return '';
  }
};

export default CalendarHeatmap;
