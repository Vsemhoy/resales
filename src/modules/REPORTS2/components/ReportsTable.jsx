/**
 * ReportsTable.jsx
 * 
 * Таблица с метриками по типам событий
 * 
 * Структура:
 * | Сотрудник ↕ | КП ↕ | Счёт ↕ | Звонок ↕ | ... | Всего ↕ | ▶ |
 * |-------------|------|--------|----------|-----|---------|---|
 * | Иванов И.И. |  12  |   8    |    45    | ... |   85    | ▶ |
 * |   └─ детализация (раскрывается)                            |
 * |-------------|------|--------|----------|-----|---------|---|
 * | ИТОГО       |  35  |   25   |   144    | ... |  264    | ▶ |
 */

import React from 'react';
import { Button, Spin, Empty, Tooltip, Tag } from 'antd';
import { 
  CaretUpOutlined, 
  CaretDownOutlined, 
  RightOutlined,
  DownOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getEventTypeColor, getEventTypeName } from '../../CALENDAR2/components/mock/CALENDARMOCK';


const ReportsTable = ({
  data,
  totals,
  activeTypes,
  sortField,
  sortOrder,
  onSort,
  expandedUserId,
  onExpandUser,
  detailEvents,
  detailLoading,
  onEventClick,
}) => {
  
  // Рендер заголовка колонки с сортировкой
  const renderSortableHeader = (field, label, width = 'auto') => {
    const isActive = sortField === field;
    const icon = isActive 
      ? (sortOrder === 'asc' ? <CaretUpOutlined /> : <CaretDownOutlined />)
      : <CaretDownOutlined style={{ opacity: 0.3 }} />;
    
    return (
      <th 
        className={`reports-th sortable ${isActive ? 'active' : ''}`}
        style={{ width }}
        onClick={() => onSort(field)}
      >
        <span className="reports-th-content">
          <div className='reports-th-label'>
          {label}
          </div>
          <span className="reports-sort-icon">{icon}</span>
        </span>
      </th>
    );
  };

  // Рендер строки данных
  const renderDataRow = (row, isTotal = false) => {
    const isExpanded = expandedUserId === (isTotal ? 'all' : row.user_id);
    
    return (
      <React.Fragment key={isTotal ? 'total' : row.user_id}>
        <tr className={`reports-row ${isTotal ? 'total-row' : ''} ${isExpanded ? 'expanded' : ''}`}>
          {/* Сотрудник */}
          <td className="reports-td reports-td-name">
            <div className="reports-user-info">
              <span className="reports-user-name">
                {isTotal ? 'ИТОГО' : row.user_name}
              </span>
              {!isTotal && row.department_name && (
                <span className="reports-user-dept">{row.department_name}</span>
              )}
            </div>
          </td>
          
          {/* Колонки по типам */}
          {activeTypes.map(type => {
            const count = row[`type_${type.id}`] || 0;
            const hasValue = count > 0;
            
            return (
              <td 
                key={type.id} 
                className={`reports-td reports-td-number ${hasValue ? 'has-value' : ''}`}
              >
                <Tooltip title={type.title}>
                  <span 
                    className="reports-cell-value"
                    style={{ 
                      backgroundColor: hasValue ? `${type.color}30` : 'transparent',
                      color: hasValue ? getContrastColorDark(type.color) : '#ccc',
                    }}
                  >
                    {count}
                  </span>
                </Tooltip>
              </td>
            );
          })}
          
          {/* Итого */}
          <td className="reports-td reports-td-total">
            <span className={`reports-total-value ${row.total > 0 ? 'has-value' : ''}`}>
              {row.total || 0}
            </span>
          </td>
          
          {/* Кнопка детализации */}
          <td className="reports-td reports-td-action">
            <Button
              type="text"
              size="small"
              icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
              onClick={() => onExpandUser(isTotal ? 'all' : row.user_id)}
              className="reports-expand-btn"
              disabled={row.total === 0}
            />
          </td>
        </tr>
        
        {/* Детализация */}
        {isExpanded && (
          <tr className="reports-detail-row">
            <td colSpan={activeTypes.length + 3}>
              <ReportsDetailPanel
                events={detailEvents}
                loading={detailLoading}
                onEventClick={onEventClick}
                userName={isTotal ? 'Все сотрудники' : row.user_name}
              />
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  // Контрастный цвет для темного фона
  const getContrastColorDark = (hexColor) => {
    if (!hexColor) return '#333';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Делаем цвет темнее для текста
    return `rgb(${Math.floor(r * 0.6)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 0.6)})`;
  };

  if (data.length === 0) {
    return (
      <div className="reports-empty">
        <Empty description="Нет данных за выбранный период" />
      </div>
    );
  }

  return (
    <div className="reports-table-container">
      <table className="reports-table">
        <thead>
          <tr>
            {renderSortableHeader('user_name', 'Сотрудник', '200px')}
            
            {activeTypes.map(type => (
              <th 
                key={type.id}
                className="reports-th sortable"
                onClick={() => onSort(`type_${type.id}`)}
              >
                <Tooltip title={type.title}>
                  <span className="reports-th-content">
                    <span 
                      className="reports-type-dot"
                      style={{ backgroundColor: type.color }}
                    />
                    <div className='reports-th-label'>
                    {type.name}
                    </div>
                    {}
                    <span className="reports-sort-icon">
                      {sortField === `type_${type.id}` 
                        ? (sortOrder === 'asc' ? <CaretUpOutlined /> : <CaretDownOutlined />)
                        : <CaretDownOutlined style={{ opacity: 0.3 }} />
                      }
                    </span>
                  </span>
                </Tooltip>
              </th>
            ))}
            
            {renderSortableHeader('total', 'Всего', '80px')}
            
            <th className="reports-th reports-th-action" style={{ width: '50px' }}>
              {/* Пусто */}
            </th>
          </tr>
        </thead>
        
        <tbody>
          {/* Строки данных */}
          {data.map(row => renderDataRow(row))}
          
          {/* Строка итогов */}
          {data.length > 0 && renderDataRow(totals, true)}
        </tbody>
      </table>
    </div>
  );
};

// =============================================================================
// ПАНЕЛЬ ДЕТАЛИЗАЦИИ
// =============================================================================

const ReportsDetailPanel = ({ events, loading, onEventClick, userName }) => {
  if (loading) {
    return (
      <div className="reports-detail-loading">
        <Spin />
        <span>Загрузка событий...</span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="reports-detail-empty">
        Нет событий за выбранный период
      </div>
    );
  }

  // Группируем события по датам
  const eventsByDate = events.reduce((acc, event) => {
    const date = event.event_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  // Сортируем даты по убыванию
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="reports-detail-panel">
      <div className="reports-detail-header">
        <span className="reports-detail-title">
          Детализация: {userName}
        </span>
        <span className="reports-detail-count">
          {events.length} событий
        </span>
      </div>
      
      <div className="reports-detail-content">
        {sortedDates.map(date => (
          <div key={date} className="reports-detail-date-group">
            <div className="reports-detail-date-header">
              {dayjs(date).format('DD MMMM YYYY, dddd')}
            </div>
            
            <div className="reports-detail-events">
              {eventsByDate[date].map(event => (
                <DetailEventCard
                  key={event.id}
                  event={event}
                  onClick={() => onEventClick(event)}
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
// КАРТОЧКА СОБЫТИЯ В ДЕТАЛИЗАЦИИ
// =============================================================================

const DetailEventCard = ({ event, onClick }) => {
  const color = getEventTypeColor(event.type);
  const typeName = getEventTypeName(event.type);
  
  return (
    <div 
      className="reports-detail-card"
      style={{ borderLeftColor: color }}
      onDoubleClick={onClick}
    >
      <div className="reports-detail-card-header">
        <Tag color={color} className="reports-detail-card-type">
          {typeName}
        </Tag>
        
        {event.event_time && (
          <span className="reports-detail-card-time">
            {event.event_time.slice(0, 5)}
          </span>
        )}
        
        {event.comments_count > 0 && (
          <span className="reports-detail-card-comments">
            <CommentOutlined /> {event.comments_count}
          </span>
        )}
      </div>
      
      <div className="reports-detail-card-content">
        {event.content}
      </div>
      
      {event.org_name && (
        <div className="reports-detail-card-org">
          {event.org_name}
          {event.is_curator === 1 && (
            <Tag color="blue" size="small" style={{ marginLeft: 6 }}>Куратор</Tag>
          )}
        </div>
      )}
      
      {event.amount && (
        <div className="reports-detail-card-amount">
          {new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
          }).format(event.amount)}
        </div>
      )}
      
      <div className="reports-detail-card-author">
        {event.user_name}
      </div>
    </div>
  );
};

export default ReportsTable;
