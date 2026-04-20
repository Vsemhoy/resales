/**
 * CalendarGrid.jsx
 * 
 * Сетка календаря с событиями
 * 
 * Режимы отображения:
 * - День: один день с часами
 * - Неделя: 7 дней в ряд с часами
 * - Месяц: классическая сетка месяца
 * - Квартал: 3 месяца компактно
 */

import React, { useMemo } from 'react';
import { Tooltip, Badge } from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { VIEW_MODES } from './hooks/UseCalendarFilters';
import { getEventTypeColor, getEventTypeName } from './mock/CALENDARMOCK';
import { DocumentCurrencyDollarIcon, MoonIcon, NewspaperIcon, PencilSquareIcon, PhoneArrowUpRightIcon, RocketLaunchIcon, ShieldCheckIcon, ShoppingCartIcon, StarIcon, TableCellsIcon, UserIcon, UserPlusIcon } from '@heroicons/react/24/outline';

dayjs.extend(isoWeek);

// Дни недели
const WEEK_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEK_DAYS_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const CalendarGrid = ({
  viewMode,
  selectedDate,
  dateRange,
  eventsByDate,
  onEventClick,
  onDateDoubleClick,
  onDateSelect,
}) => {
  
  // Рендер в зависимости от режима
  switch (viewMode) {
    case VIEW_MODES.DAY:
      return (
        <DayView
          date={selectedDate}
          events={eventsByDate[selectedDate.format('YYYY-MM-DD')] || []}
          onEventClick={onEventClick}
          onDoubleClick={onDateDoubleClick}
        />
      );
      
    case VIEW_MODES.WEEK:
      return (
        <WeekView
          selectedDate={selectedDate}
          eventsByDate={eventsByDate}
          onEventClick={onEventClick}
          onDateDoubleClick={onDateDoubleClick}
          onDateSelect={onDateSelect}
        />
      );
      
    case VIEW_MODES.QUARTER:
      return (
        <QuarterView
          selectedDate={selectedDate}
          eventsByDate={eventsByDate}
          onEventClick={onEventClick}
          onDateDoubleClick={onDateDoubleClick}
          onDateSelect={onDateSelect}
        />
      );
      
    case VIEW_MODES.MONTH:
    default:
      return (
        <MonthView
          selectedDate={selectedDate}
          eventsByDate={eventsByDate}
          onEventClick={onEventClick}
          onDateDoubleClick={onDateDoubleClick}
          onDateSelect={onDateSelect}
        />
      );
  }
};

// =============================================================================
// РЕЖИМ "ДЕНЬ"
// =============================================================================

const DayView = ({ date, events, onEventClick, onDoubleClick }) => {
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00
  
  // Группируем события по часам
  const eventsByHour = useMemo(() => {
    const grouped = {};
    events.forEach(event => {
      const hour = event.event_time 
        ? parseInt(event.event_time.split(':')[0], 10)
        : 9; // Дефолтно 9:00
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(event);
    });
    return grouped;
  }, [events]);

  return (
    <div className="calendar-day-view">
      <div className="calendar-day-header">
        <span className="calendar-day-name">{WEEK_DAYS_FULL[date.isoWeekday() - 1]}</span>
        <span className="calendar-day-date">{date.format('D MMMM YYYY')}</span>
      </div>
      
      <div className="calendar-day-body">
        {hours.map(hour => (
          <div 
            key={hour} 
            className="calendar-hour-row"
            onDoubleClick={() => onDoubleClick(date.format('YYYY-MM-DD'))}
          >
            <div className="calendar-hour-label">
              {String(hour).padStart(2, '0')}:00
            </div>
            <div className="calendar-hour-content">
              {(eventsByHour[hour] || []).map(event => (
                <EventBadge
                  key={event.id}
                  event={event}
                  onClick={() => onEventClick(event)}
                  compact={false}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// РЕЖИМ "НЕДЕЛЯ"
// =============================================================================

const WeekView = ({ selectedDate, eventsByDate, onEventClick, onDateDoubleClick, onDateSelect }) => {
  const weekStart = selectedDate.startOf('isoWeek');
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00
  const today = dayjs();

  return (
    <div className="calendar-week-view">
      {/* Заголовок с днями */}
      <div className="calendar-week-header">
        <div className="calendar-week-time-header" />
        {days.map((day, index) => {
          const isToday = day.isSame(today, 'day');
          const isWeekend = index >= 5;
          
          return (
            <div 
              key={day.format('YYYY-MM-DD')}
              className={`calendar-week-day-header ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
              // onClick={() => onDateSelect(day.format('YYYY-MM-DD'))}
              onDoubleClick={() => onDateDoubleClick(day.dateStr)}
            >
              <span className="calendar-week-day-name">{WEEK_DAYS_SHORT[index]}</span>
              <span className={`calendar-week-day-number ${isToday ? 'today-number' : ''}`}>
                {day.format('D')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Сетка часов */}
      <div className="calendar-week-body">
        {hours.map(hour => (
          <div key={hour} className="calendar-week-hour-row">
            <div className="calendar-week-time-label">
              {String(hour).padStart(2, '0')}:00
            </div>
            {days.map((day, index) => {
              const dateStr = day.format('YYYY-MM-DD');
              const dayEvents = eventsByDate[dateStr] || [];
              const hourEvents = dayEvents.filter(e => {
                const eventHour = e.event_time 
                  ? parseInt(e.event_time.split(':')[0], 10)
                  : 9;
                return eventHour === hour;
              });
              const isWeekend = index >= 5;
              
              return (
                <div
                  key={dateStr}
                  className={`calendar-week-cell ${isWeekend ? 'weekend' : ''} ${day.isSame(today, 'day') ? 'today' : ''}`}
                  onDoubleClick={() => onDateDoubleClick(dateStr)}
                >
                  {hourEvents.map(event => (
                    <EventBadge
                      key={event.id}
                      event={event}
                      onClick={() => onEventClick(event)}
                      compact
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// РЕЖИМ "МЕСЯЦ"
// =============================================================================

const MonthView = ({ selectedDate, eventsByDate, onEventClick, onDateDoubleClick, onDateSelect }) => {
  const today = dayjs();
  
  // Генерируем дни месяца с padding для начала и конца
  const calendarDays = useMemo(() => {
    const startOfMonth = selectedDate.startOf('month');
    const endOfMonth = selectedDate.endOf('month');
    
    // Начинаем с понедельника недели, в которую входит 1-е число
    const startDate = startOfMonth.startOf('isoWeek');
    // Заканчиваем воскресеньем недели, в которую входит последний день
    const endDate = endOfMonth.endOf('isoWeek');
    
    const days = [];
    let current = startDate;
    
    while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
      days.push({
        date: current,
        dateStr: current.format('YYYY-MM-DD'),
        isCurrentMonth: current.month() === selectedDate.month(),
        isToday: current.isSame(today, 'day'),
        isWeekend: current.isoWeekday() >= 6,
      });
      current = current.add(1, 'day');
    }
    
    return days;
  }, [selectedDate, today]);

  // Разбиваем на недели
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  return (
    <div className="calendar-month-view">
      {/* Заголовок с днями недели */}
      <div className="calendar-month-header">
        {WEEK_DAYS_SHORT.map((day, index) => (
          <div 
            key={day} 
            className={`calendar-month-weekday ${index >= 5 ? 'weekend' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Сетка дней */}
      <div className="calendar-month-body">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-month-week">
            {week.map(day => {
              const events = eventsByDate[day.dateStr] || [];
              //const visibleEvents = events.slice(0, 12);
              //const moreCount = events.length - 12;
              
              return (
                <div
                  key={day.dateStr}
                  className={`calendar-month-cell ${
                    !day.isCurrentMonth ? 'outside' : ''
                  } ${
                    day.isToday ? 'today' : ''
                  } ${
                    day.isWeekend ? 'weekend' : ''
                  }`}
                  onDoubleClick={() => onDateDoubleClick(day.dateStr)}
                  // onClick={() => onDateSelect(day.dateStr)}
                >
                  <div className={`calendar-month-day-number ${day.isToday ? 'today-number' : ''}`}>
                    {day.date.format('D')}
                  </div>
                  
                  <div className="calendar-month-events">
                    {events.map(event => (
                      <EventBadge
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick(event)}
                        compact
                      />
                    ))}
                    
                    {/*{moreCount > 0 && (
                      <div className="calendar-month-more">
                        +{moreCount} ещё
                      </div>
                    )}*/}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// РЕЖИМ "КВАРТАЛ"
// =============================================================================

const QuarterView = ({ selectedDate, eventsByDate, onEventClick, onDateDoubleClick, onDateSelect }) => {
  const today = dayjs();
  
  // Определяем квартал
  const quarterStart = Math.floor(selectedDate.month() / 3) * 3;
  const months = [0, 1, 2].map(i => selectedDate.month(quarterStart + i));

  return (
    <div className="calendar-quarter-view">
      {months.map(monthDate => (
        <QuarterMonth
          key={monthDate.format('YYYY-MM')}
          monthDate={monthDate}
          eventsByDate={eventsByDate}
          today={today}
          onEventClick={onEventClick}
          onDateDoubleClick={onDateDoubleClick}
          onDateSelect={onDateSelect}
        />
      ))}
    </div>
  );
};

const QuarterMonth = ({ monthDate, eventsByDate, today, onEventClick, onDateDoubleClick, onDateSelect }) => {
  const startOfMonth = monthDate.startOf('month');
  const endOfMonth = monthDate.endOf('month');
  const startDate = startOfMonth.startOf('isoWeek');
  const endDate = endOfMonth.endOf('isoWeek');
  
  const days = [];
  let current = startDate;
  
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    days.push({
      date: current,
      dateStr: current.format('YYYY-MM-DD'),
      isCurrentMonth: current.month() === monthDate.month(),
      isToday: current.isSame(today, 'day'),
    });
    current = current.add(1, 'day');
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="calendar-quarter-month">
      <div className="calendar-quarter-month-title">
        {monthDate.format('MMMM')}
      </div>
      
      <div className="calendar-quarter-header">
        {WEEK_DAYS_SHORT.map(day => (
          <div key={day} className="calendar-quarter-weekday">{day[0]}</div>
        ))}
      </div>
      
      <div className="calendar-quarter-body">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-quarter-week">
            {week.map(day => {
              const events = eventsByDate[day.dateStr] || [];
              const hasEvents = events.length > 0;
              
              return (
                <Tooltip
                  key={day.dateStr}
                  title={hasEvents ? `${events.length} событий` : null}
                  placement="top"
                >
                  <div
                    className={`calendar-quarter-cell ${
                      !day.isCurrentMonth ? 'outside' : ''
                    } ${
                      day.isToday ? 'today' : ''
                    } ${
                      hasEvents ? 'has-events' : ''
                    }`}
                    onClick={() => onDateSelect(day.dateStr)}
                    onDoubleClick={() => onDateDoubleClick(day.dateStr)}
                  >
                    <span className="calendar-quarter-day-number">
                      {day.date.format('D')}
                    </span>
                    {hasEvents && (
                      <span 
                        className="calendar-quarter-dot"
                        style={{ 
                          backgroundColor: getEventTypeColor(events[0].type)
                        }}
                      >{events?.length}</span>
                    )}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// BADGE СОБЫТИЯ
// =============================================================================

const EventBadge = ({ event, onClick, compact = false }) => {
  const color = getEventTypeColor(event.type);
  const typeName = getEventTypeName(event.type);
  
  const tooltipContent = (
    <div className="event-tooltip">
      <div className="event-tooltip-type">{typeName}</div>
      <div className="event-tooltip-content">{event.content}</div>
      {event.org_name && (
        <div className="event-tooltip-org">{event.org_name}</div>
      )}
      {event.event_time && (
        <div className="event-tooltip-time">
          {event.event_time.slice(0, 5)}
        </div>
      )}
      {event.comments_count > 0 && (
        <div className="event-tooltip-comments">
          💬 {event.comments_count}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement="top" mouseEnterDelay={0.3}>
      <div
        className={`event-badge ${compact ? 'compact' : ''}`}
        style={{ 
          backgroundColor: color + "bb",
          borderColor: color,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        
        {compact ? (
          <div className="event-badge-dot" >
            <div 
              className='event-badge-body'
            >
            {event.type === 1 && (
              <div>
              <ShoppingCartIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 2 && (
              <div>
              <DocumentCurrencyDollarIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 3 && (
              <div>
              <DocumentCurrencyDollarIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 4 && (
              <div>
              <DocumentCurrencyDollarIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 5 && (
              <div>
              <ShieldCheckIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 6 && (
              <div>
              <RocketLaunchIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 7 && (
              <div>
              <PhoneArrowUpRightIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 8 && (
              <div>
              <DocumentCurrencyDollarIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 9 && (
              <div>
              <StarIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 10 && (
              <div>
              <NewspaperIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 11 && (
              <div>
              <UserPlusIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 12 && (
              <div>
              <UserIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 13 && (
              <div>
             <TableCellsIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 14 && (
              <div>
             <PencilSquareIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            {event.type === 15 && (
              <div>
             <MoonIcon height={'15px'} />
                <span className='event-badge-dot-typename'>
                  {typeName}
                </span>
              </div>
            )}
            <div>
              {event.org_name && (
                <div className="event-tooltip-org">{event.org_name}</div>
              )}
            </div>
            </div>

          </div>
        ) : (
          <>
            <span className="event-badge-type">{typeName}</span>
            <span className="event-badge-content">{event.content}</span>
            {event.comments_count > 0 && (
              <Badge count={event.comments_count} size="small" />
            )}
          </>
        )}
      </div>
    </Tooltip>
  );
};

export default CalendarGrid;
