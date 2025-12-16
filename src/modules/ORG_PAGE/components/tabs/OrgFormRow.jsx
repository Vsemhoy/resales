/**
 * OrgFormRow.jsx - ПОЛНЫЙ АНАЛОГ TorgPageSectionRow для antd Form
 * 
 * Использует ТЕ ЖЕ CSS классы: sk-omt-*, torg-section, omt-*-col
 * Визуально идентичен старому интерфейсу
 */

import React, { useState } from 'react';
import { Form } from 'antd';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';

/**
 * Кастомный компонент строки формы
 * Полностью повторяет стиль TorgPageSectionRow
 * 
 * Использование:
 * <OrgFormRow
 *   inputs={[
 *     { name: 'name', label: 'Название', required: true, children: <Input /> },
 *     { name: 'inn', label: 'ИНН', children: <Input /> },
 *   ]}
 *   editMode={editMode}
 *   extratext={[
 *     { name: 'comment', label: 'Комментарий', children: <TextArea /> }
 *   ]}
 * />
 */
const OrgFormRow = ({ 
  inputs = [], 
  editMode = false, 
  action = null,
  extratext = [],
  explabel = 'комм',
  transKey = ''
}) => {
  const [opened, setOpened] = useState(false);

  return (
    <div className={`torg-section ${editMode ? 'torg-section-editmode' : ''}`}>
      <div className="sk-omt-row-wrapper sk-omt-rw-first">
        <div className={`sk-omt-row omt-${inputs.length}-col`}>
          {inputs.map((item, index) => (
            <FormCell
              key={`formrow_${index}_${transKey}`}
              item={item}
              editMode={editMode}
              index={index}
              extratext={extratext}
              explabel={explabel}
              opened={opened}
              onToggle={() => setOpened(!opened)}
            />
          ))}
        </div>
        
        {action && editMode && (
          <div className="sk-omt-action-block">{action}</div>
        )}
      </div>

      {/* Раскрывающийся блок с дополнительными полями */}
      {extratext.length > 0 && opened && (
        <div>
          {extratext.map((item, index) => (
            <div className="sk-omt-row-wrapper" key={`extra_${index}`}>
              <div className="sk-omt-row omt-1-col">
                <FormCell
                  item={item}
                  editMode={editMode}
                  index={0}
                  showToggle={false}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Ячейка формы - обёртка над Form.Item
 * Сохраняет стили sk-omt-legend / sk-omt-content
 */
const FormCell = ({ 
  item, 
  editMode, 
  index, 
  extratext = [], 
  explabel,
  opened,
  onToggle,
  showToggle = true 
}) => {
  // Получаем значение для проверки required
  const form = Form.useFormInstance();
  const value = Form.useWatch(item.name, form);
  
  const isEmpty = value === undefined || value === null || value === '';
  const isRequired = item.required && editMode && isEmpty;

  return (
    <div className={isRequired ? 'sa-required-field-block' : ''}>
      {/* Левая часть - метка */}
      <div className="sk-omt-legend sa-flex-space">
        {/* Кнопка раскрытия комментария */}
        {showToggle && extratext.length > 0 && index === 0 && (
          <div
            className={`sk-omt-comment-trigger ${
              hasExtraValue(extratext, form) ? 'sk-omt-comment-trigger-treasure' : ''
            } ${
              hasRequiredEmptyExtra(extratext, form) ? 'sk-omt-comment-trigger-hot' : ''
            }`}
            onClick={onToggle}
          >
            <span>{opened ? <CaretUpOutlined /> : <CaretDownOutlined />}</span>
            <span>{explabel}</span>
          </div>
        )}
        <div></div>
        <span>{item.label}</span>
      </div>

      {/* Правая часть - инпут */}
      <div className="sk-omt-content" style={{ paddingLeft: '0px' }}>
        <div className="sk-omt-content-formatted">
          {/* 
            КЛЮЧЕВОЙ МОМЕНТ: Form.Item с noStyle
            - Убирает стандартную обёртку antd
            - Сохраняет функциональность (валидация, связь с формой)
          */}
          <Form.Item
            name={item.name}
            rules={item.rules}
            noStyle
            // Для вложенных путей (например contacts[0].name)
            // используем shouldUpdate
          >
            {item.children}
          </Form.Item>
        </div>
      </div>
    </div>
  );
};

// Хелперы
const hasExtraValue = (extratext, form) => {
  return extratext.some(item => {
    const val = form?.getFieldValue(item.name);
    return val !== null && val !== undefined && val !== '';
  });
};

const hasRequiredEmptyExtra = (extratext, form) => {
  return extratext.some(item => {
    const val = form?.getFieldValue(item.name);
    return item.required && (val === '' || val === null || val === undefined);
  });
};

export default OrgFormRow;


// =============================================================================
// АЛЬТЕРНАТИВНЫЙ ВАРИАНТ: Простой FormRow без Form.Item
// Для случаев когда Form.Item уже обёрнут выше
// =============================================================================

/**
 * Простая строка без Form.Item - когда нужна только визуальная обёртка
 */
export const SimpleOrgRow = ({ 
  inputs = [], 
  editMode = false, 
  action = null 
}) => {
  return (
    <div className={`torg-section ${editMode ? 'torg-section-editmode' : ''}`}>
      <div className="sk-omt-row-wrapper sk-omt-rw-first">
        <div className={`sk-omt-row omt-${inputs.length}-col`}>
          {inputs.map((input, index) => (
            <div 
              key={index}
              className={input.required && editMode && !input.value ? 'sa-required-field-block' : ''}
            >
              <div className="sk-omt-legend sa-flex-space">
                <div></div>
                <span>{input.label}</span>
              </div>
              <div className="sk-omt-content" style={{ paddingLeft: '0px' }}>
                <div className="sk-omt-content-formatted">
                  {input.children}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {action && editMode && (
          <div className="sk-omt-action-block">{action}</div>
        )}
      </div>
    </div>
  );
};
