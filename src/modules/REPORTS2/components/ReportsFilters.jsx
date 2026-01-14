/**
 * ReportsFilters.jsx
 * 
 * Панель фильтров для страницы отчётов
 * 
 * Фильтры:
 * - Период (месяц/квартал/полгода/год)
 * - Филиал
 * - Отдел
 * - Сотрудники (MultiSelect)
 * - Типы событий (MultiSelect)
 * - Скрыть пустые (Checkbox)
 */

import React, { useMemo } from 'react';
import { Select, Checkbox, Tag } from 'antd';
import { 
  UserOutlined, 
  FilterOutlined, 
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

import { REPORT_EVENT_TYPES } from '../../CALENDAR2/components/mock/CALENDARMOCK';
import { PERIOD_LABELS } from './hooks/useReportFilters';

const { Option } = Select;

const ReportsFilters = ({
  period,
  companyId,
  departmentId,
  userIds,
  types,
  hideEmpty,
  onPeriodChange,
  onCompanyChange,
  onDepartmentChange,
  onUsersChange,
  onTypesChange,
  onHideEmptyChange,
  companies,
  departments,
  users,
  usersLoading,
  isAdmin,
}) => {

  // Опции периодов
  const periodOptions = useMemo(() => {
    return Object.entries(PERIOD_LABELS).map(([value, label]) => ({
      value,
      label,
    }));
  }, []);

  // Опции пользователей
  const userOptions = useMemo(() => {
    return users.map(user => ({
      value: user.user_id,
      label: `${user.user_surname} ${user.user_name[0]}.${user.user_patronymic[0]}.`,
      fullName: `${user.user_surname} ${user.user_name} ${user.user_patronymic}`,
      department: user.department_name,
    }));
  }, [users]);

  // Рендер тега типа события
  const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const type = REPORT_EVENT_TYPES.find(t => t.id === value);
    
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

  // При смене отдела сбрасываем выбранных пользователей
  const handleDepartmentChange = (value) => {
    onDepartmentChange(value);
    onUsersChange([]); // Сбрасываем выбранных пользователей
  };

  return (
    <div className="reports-filters">
      <div className="reports-filters-row">
        {/* Период */}
        <div className="reports-filter-item">
          <label className="reports-filter-label">
            <CalendarOutlined /> Период
          </label>
          <Select
            value={period}
            onChange={onPeriodChange}
            style={{ width: 130 }}
            options={periodOptions}
          />
        </div>

        {/* Филиал */}
        <div className="reports-filter-item">
          <label className="reports-filter-label">Филиал</label>
          <Select
            value={companyId}
            onChange={onCompanyChange}
            style={{ width: 150 }}
            disabled={!isAdmin && companies.length <= 1}
          >
            {companies.map(company => (
              <Option key={company.id} value={company.id}>
                {company.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Отдел */}
        <div className="reports-filter-item">
          <label className="reports-filter-label">
            <TeamOutlined /> Отдел
          </label>
          <Select
            value={departmentId}
            onChange={handleDepartmentChange}
            style={{ width: 200 }}
            allowClear
            placeholder="Все отделы"
          >
            {departments.filter(d => d.visible).map(dept => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Сотрудники */}
        <div className="reports-filter-item reports-filter-users">
          <label className="reports-filter-label">
            <UserOutlined /> Сотрудники
          </label>
          <Select
            mode="multiple"
            value={userIds}
            onChange={onUsersChange}
            loading={usersLoading}
            placeholder="Все сотрудники"
            style={{ minWidth: 200, maxWidth: 350 }}
            maxTagCount={2}
            maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
            filterOption={(input, option) => {
              const user = userOptions.find(u => u.value === option.value);
              return user?.fullName?.toLowerCase().includes(input.toLowerCase()) ||
                     user?.department?.toLowerCase().includes(input.toLowerCase());
            }}
            optionLabelProp="label"
            allowClear
          >
            {userOptions.map(user => (
              <Option 
                key={user.value} 
                value={user.value} 
                label={user.label}
              >
                <div className="reports-filter-user-option">
                  <span className="reports-filter-user-name">{user.fullName}</span>
                  <span className="reports-filter-user-dept">{user.department}</span>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {/* Типы событий */}
        <div className="reports-filter-item reports-filter-types">
          <label className="reports-filter-label">
            <FilterOutlined /> Колонки
          </label>
          <Select
            mode="multiple"
            value={types}
            onChange={onTypesChange}
            placeholder="Все типы"
            style={{ minWidth: 180, maxWidth: 300 }}
            maxTagCount={2}
            maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
            tagRender={tagRender}
            optionLabelProp="label"
            allowClear
          >
            {REPORT_EVENT_TYPES.map(type => (
              <Option 
                key={type.id} 
                value={type.id} 
                label={type.name}
              >
                <div className="reports-filter-type-option">
                  <span 
                    className="reports-filter-type-color" 
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="reports-filter-type-name">{type.name}</span>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {/* Скрыть пустые */}
        <div className="reports-filter-item reports-filter-checkbox">
          <Checkbox
            checked={hideEmpty}
            onChange={(e) => onHideEmptyChange(e.target.checked)}
          >
            Скрыть пустые
          </Checkbox>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilters;
