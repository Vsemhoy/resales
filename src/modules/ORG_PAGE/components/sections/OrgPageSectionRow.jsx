import React, { useEffect, useState, useMemo } from 'react';


import {
  CaretDownOutlined,
  CaretUpOutlined,
  EnterOutlined,
} from '@ant-design/icons';
import {
  Input,
  InputNumber,
  DatePicker,
  TimePicker,
  Checkbox,
  Select,
  ColorPicker,
  Form,
} from 'antd';

import 'dayjs/locale/ru';
import debounce from 'lodash/debounce';
import dayjs, { Dayjs } from 'dayjs';


import { Typography } from 'antd';


const { TextArea } = Input;
const { Option } = Select;
const { Paragraph } = Typography;
// Вспомогательные функции
const formatValue = (value, type) => {
  if (value === null || value === undefined) return null;
  if (type === 'integer' || type === 'uinteger') return Number.parseInt(value, 10);
  if (type === 'float' || type === 'ufloat') return Number.parseFloat(value);
  return value;
};

const OrgPageSectionRow = (props) => {
  const [columns, setColumns] = useState(1);
  const [titles, setTitles] = useState(['Title one']);
  const [fields, setFields] = useState([]); // только основные поля
  const [commentConfig, setCommentConfig] = useState(null); // только конфиг коммента
  const [opened, setOpened] = useState(false);
  const [editMode, setEditMode] = useState(props.edit_mode ?? false);

  const [localValues, setLocalValues] = useState({}); // теперь ключи — это `name`
  const [errors, setErrors] = useState({});




  // Дебаунс для отправки изменений
  const debouncedOnChange = useMemo(() => {
    return debounce((data) => {
      if (props.on_change) {
        props.on_change(data);
      }
    }, 1000);
  }, [props.on_change]);

  // Обновление editMode
  useEffect(() => {
    setEditMode(props.edit_mode ?? false);
  }, [props.edit_mode]);

  // Инициализация данных
  useEffect(() => {
    if (props.columns > 1) setColumns(props.columns);
    if (props.titles) {
      setTitles(props.titles);
      if (props.titles.length > 1) setColumns(2);
    }
    if (props.datas) {
      setFields(props.datas);
    }
    if (props.comment) {
      setCommentConfig(props.comment);
    }

    // Инициализация локального состояния по `name`
    const initialValues = {};

    props.datas?.forEach((field) => {
      if (field.name) {
        initialValues[field.name] = field.value !== undefined ? field.value : null;
      }
    });

    if (props.comment?.name) {
      initialValues[props.comment.name] = props.comment.value !== undefined ? props.comment.value : null;
    }

    setLocalValues(initialValues);
  }, [props.datas, props.comment, props.titles, props.columns]);

  // Обработчик изменения поля
  const handleChange = (fieldName, rawValue, field) => {
    let newValue = rawValue;

    // Для числовых типов — обработка знака
    if (field.type.startsWith('u') && newValue != null && newValue < 0) {
      newValue = 0;
    }

    // Валидация min/max
    if (field.min !== undefined && newValue != null && newValue < field.min) {
      setErrors((prev) => ({ ...prev, [fieldName]: `Минимум: ${field.min}` }));
      return;
    }
    if (field.max !== undefined && newValue != null && newValue > field.max) {
      setErrors((prev) => ({ ...prev, [fieldName]: `Максимум: ${field.max}` }));
      return;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: null }));

    // Форматируем значение
    const formattedValue = formatValue(newValue, field.type);
    // const finalValue = field.nullable === false && (formattedValue === '' || formattedValue == null)
    //   ? null
    //   : formattedValue;
    let finalValue = formattedValue;
    if (field.nullable === false) {
      // Если поле не nullable, то пустая строка должна оставаться пустой строкой
      if (formattedValue === '' || formattedValue == null) {
        finalValue = ''; // возвращаем пустую строку вместо null
      }
    } else {
      // Если поле nullable, то можно возвращать null
      if (formattedValue === '' || formattedValue == null) {
        finalValue = null;
      }
    }


    setLocalValues((prev) => {
      const updated = { ...prev, [fieldName]: finalValue };
      debouncedOnChange(updated); // отправляем весь объект
      return updated;
    });
  };

  // Рендер одного поля
  const renderField = (field, value, onChange) => {
    const isRequired = field.required && !field.nullable;

    if (!editMode) {
      if (field.type === 'checkbox') {
        return <div className="sk-omt-content-formatted">{value ? 'Да' : 'Нет'}</div>;
      } else if (field.type === 'textarea'){

        return <Typography.Paragraph
        style={{ whiteSpace: 'pre-line', display: 'block' }}
        ellipsis={false}
      >
        {String(value ?? (field.nullable ? '(не задано)' : ''))}
      </Typography.Paragraph>;
      }
      return <div className="sk-omt-content-formatted">{String(value ?? (field.nullable ? '(не задано)' : ''))}</div>;
    }

    const commonProps = {
      value,
      onChange: (e) => {
        const val = e?.target?.value ?? e;
        onChange(
            field.name,
            val,
            field);
      },
      disabled: false,
      style: { width: '100%' },
    };

    switch (field.type) {
      case 'string':
      case 'email':
        return (
          <Input
            variant="underlined"
            {...commonProps}
            type={field.type}
            placeholder={isRequired ? 'Обязательно' : ''}
            nullable={field.nullable}
          />
        );

      case 'integer':
      case 'uinteger':
      case 'float':
      case 'ufloat':
        return (
          <InputNumber
            variant="underlined"
            {...commonProps}
            min={field.type.startsWith('u') ? 0 : field.min}
            max={field.max}
            precision={field.type.includes('float') ? 2 : 0}
            style={{ width: '100%' }}
          />
        );

      case 'textarea':
        return <TextArea variant="underlined" {...commonProps} rows={3} />;

      case 'date':
        return (
          <DatePicker
            variant="underlined"
            value={value ? dayjs(value) : null}
            format={"DD.MM.YYYY"}
            onChange={(date, dateString) => onChange(field.name, dateString, field)}
            style={{ width: '100%' }}
          />
        );

      case 'time':
        return (
          <TimePicker
            variant="underlined"
            value={value ? dayjs(value, 'HH:mm') : null}
            format={"HH:mm"}
            onChange={(time, timeString) => onChange(field.name, timeString, field)}
          />
        );

      case 'datetime':
        return (
          <DatePicker
            variant="underlined"
            showTime
            format={"DD.MM.YYYY HH:mm"}
            value={value ? dayjs(value) : null}
            onChange={(date, dateString) => onChange(field.name, dateString, field)}
            style={{ width: '100%' }}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            checked={!!value}
            onChange={(e) => onChange(field.name, e.target.checked, field)}
          >
            {field.title || 'Да/Нет'}
          </Checkbox>
        );

      case 'select':
        return (
          <Select
            variant="underlined"
            value={value}
            onChange={(val) => onChange(field.name, val, field)}
            style={{ width: '100%' }}
          >
            {field.options?.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        );

      case 'color':
        return (
          <ColorPicker
            value={value}
            onChange={(color) => onChange(field.name, color.toHexString(), field)}
          />
        );

      default:
        return <Input variant="underlined" {...commonProps} />;
    }
  };

  return (
    <div className={`sk-omt-row-wrapper ${editMode ? 'sk-omt-row-editor' : ''}`}>
      {/* Основная строка */}
      <div className={`sk-omt-row omt-${columns}-col`}>
        <div>
          <div className="sk-omt-legend sa-flex-space">
            <span style={{ paddingLeft: '6px' }}>
              {commentConfig && (
                <div className="sk-omt-comment-trigger" onClick={() => setOpened(!opened)}>
                  <span>{opened ? <CaretUpOutlined /> : <CaretDownOutlined />}</span>
                  <span>комм</span>
                </div>
              )}
            </span>
            <span>{titles[0]}</span>
          </div>

          {titles.length < 3 ? (
            fields[0]?.name ? (
              <div className="sk-omt-content">
                {renderField(
                  fields[0],
                  localValues[fields[0].name],
                  handleChange
                )}
              </div>
            ) : null
          ) : (
            <div className="sk-omt-content-epanded">
              {fields[0]?.name && (
                <div className="sk-omt-content">
                  {renderField(
                    fields[0],
                    localValues[fields[0].name],
                    handleChange
                  )}
                </div>
              )}
              <div className="sk-omt-legend sa-flex-space">{titles[2]}</div>
              {fields[2]?.name && (
                <div className="sk-omt-content">
                  {renderField(
                    fields[2],
                    localValues[fields[2].name],
                    handleChange
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {titles.length > 1 && fields[1]?.name && (
          <div>
            <div className="sk-omt-legend sa-flex-space">
              <span></span>
              <span>{titles[1]}</span>
            </div>
            <div className="sk-omt-content">
              {renderField(
                fields[1],
                localValues[fields[1].name],
                handleChange
              )}
            </div>
          </div>
        )}
      </div>

      {/* Блок комментария */}
      {commentConfig && opened && (
        <div className="sk-omt-row omt-1-col">
          <div>
            <div className="sk-omt-legend sa-flex-space">
              <span className="sk-comment-arrow-sign">
                <EnterOutlined />
              </span>
              <span>
                <i>Комментарий</i>
              </span>
            </div>
            <div className="sk-omt-content">
              {editMode ? (
                renderField(
                  commentConfig,
                  localValues[commentConfig.name],
                  handleChange
                )
              ) : (
               
            <Typography.Paragraph
                style={{ whiteSpace: 'pre-line', display: 'block' }}
                ellipsis={false}>
                    {commentConfig.value || '(не задано)'}
                </Typography.Paragraph>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ошибки */}
      {Object.values(errors).some(Boolean) && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
          {Object.values(errors).find(Boolean)}
        </div>
      )}
    </div>
  );
};

export default OrgPageSectionRow;