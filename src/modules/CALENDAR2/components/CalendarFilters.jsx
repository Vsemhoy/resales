/**
 * CalendarFilters.jsx
 * 
 * Панель фильтров для календаря
 * 
 * Фильтры:
 * - Филиал (Select)
 * - Сотрудники (MultiSelect с поиском)
 * - Типы событий (MultiSelect с цветными тегами)
 * - С комментариями (Checkbox)
 */

import React, { useMemo } from 'react';
import { Select, Checkbox, Tag, Space } from 'antd';
import { UserOutlined, FilterOutlined } from '@ant-design/icons';
import { EVENT_TYPES } from './mock/CALENDARMOCK';

const { Option } = Select;

const CalendarFilters = ({
  companyId,
  userIds,
  types,
  hasComments,
  onCompanyChange,
  onUsersChange,
  onTypesChange,
  onHasCommentsChange,
  companies,
  users,
  usersLoading,
  currentUserId,
  isAdmin,
  event_types,
}) => {
  
  // Типы для выбора (только real=1)
  const availableTypes = useMemo(() => {
    console.log("event_types:" + event_types)
    const list = Array.isArray(event_types) ? event_types : [];
    return list.filter(t => t?.real === 1 || t?.id === 0);
  }, [event_types]);

  // Опции пользователей
  const userOptions = useMemo(() => {
    return users.map(user => ({
      value: user.user_id,
      label: `${user.user_surname} ${user.user_name[0]}.${user.user_patronymic[0]}.`,
      fullName: `${user.user_surname} ${user.user_name} ${user.user_patronymic}`,
      department: user.department_name,
      isCurrentUser: user.user_id === currentUserId,
    }));
  }, [users, currentUserId]);

  // Рендер тега типа события
  const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const type = EVENT_TYPES.find(t => t.id === value);
    
    return (
      <Tag
        color={type?.color}
        closable={closable}
        onClose={onClose}
        style={{ 
          marginRight: 3,
          color: getContrastColor(type?.color),
        }}
      >
        {label}
      </Tag>
    );
  };

  // Определение контрастного цвета текста
  const getContrastColor = (hexColor) => {
    if (!hexColor) return '#000';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000' : '#fff';
  };

  // Обработчик изменения типов
  const handleTypesChange = (values) => {
    // Если выбрали "Все" (id=0), сбрасываем остальные
    if (values.includes(0) && !types.includes(0)) {
      onTypesChange([0]);
      return;
    }
    
    // Если выбрали что-то другое, убираем "Все"
    if (values.length > 1 && values.includes(0)) {
      onTypesChange(values.filter(v => v !== 0));
      return;
    }
    
    // Если ничего не выбрано, ставим "Все"
    if (values.length === 0) {
      onTypesChange([0]);
      return;
    }
    
    onTypesChange(values);
  };

  return (
    <div className="calendar-filters">
      <div className="calendar-filters-row">
        {/* Филиал */}
        <div className="calendar-filter-item">
          <label className="calendar-filter-label">Филиал</label>
          <Select
            value={companyId}
            onChange={onCompanyChange}
            style={{ width: 180 }}
            disabled={!isAdmin && companies.length <= 1}
          >
            {companies.map(company => (
              <Option key={company.id} value={company.id}>
                {company.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Сотрудники */}
        <div className="calendar-filter-item calendar-filter-users">
          <label className="calendar-filter-label">
            <UserOutlined /> Сотрудники
          </label>
          <Select
            mode="multiple"
            value={userIds}
            onChange={onUsersChange}
            loading={usersLoading}
            placeholder="Выберите сотрудников"
            style={{ minWidth: 250, maxWidth: 400 }}
            maxTagCount={2}
            maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
            filterOption={(input, option) => {
              const user = userOptions.find(u => u.value === option.value);
              return user?.fullName?.toLowerCase().includes(input.toLowerCase()) ||
                     user?.department?.toLowerCase().includes(input.toLowerCase());
            }}
            optionLabelProp="label"
          >
            {userOptions.map(user => (
              <Option 
                key={user.value} 
                value={user.value} 
                label={user.label}
              >
                <div className="calendar-filter-user-option">
                  <span className={`calendar-filter-user-name ${user.isCurrentUser ? 'current' : ''}`}>
                    {user.fullName}
                    {user.isCurrentUser && <Tag color="blue" style={{ marginLeft: 8 }}>Я</Tag>}
                  </span>
                  <span className="calendar-filter-user-dept">{user.department}</span>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {/* Типы событий */}
        <div className="calendar-filter-item calendar-filter-types">
          <label className="calendar-filter-label">
            <FilterOutlined /> Типы событий
          </label>
          <Select
            mode="multiple"
            value={types}
            onChange={handleTypesChange}
            placeholder="Типы событий"
            style={{ minWidth: 200, maxWidth: 350 }}
            maxTagCount={2}
            maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
            tagRender={tagRender}
            optionLabelProp="label"
          >
            {availableTypes.map(type => (
              <Option 
                key={type.id} 
                value={type.id} 
                label={type.name}
              >
                <div className="calendar-filter-type-option">
                  <span 
                    className="calendar-filter-type-color" 
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="calendar-filter-type-name">{type.name}</span>
                  <span className="calendar-filter-type-hint">{type.title}</span>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {/* Только с комментариями */}
        {/*<div className="calendar-filter-item calendar-filter-checkbox">*/}
        {/*  <Checkbox*/}
        {/*    checked={hasComments}*/}
        {/*    onChange={(e) => onHasCommentsChange(e.target.checked)}*/}
        {/*  >*/}
        {/*    С комментариями*/}
        {/*  </Checkbox>*/}
        {/*</div>*/}
      </div>
    </div>
  );
};

export default CalendarFilters;
