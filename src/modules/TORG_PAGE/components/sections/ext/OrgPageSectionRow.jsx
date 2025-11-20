import React, { useEffect, useState, useMemo } from 'react';

import { CaretDownOutlined, CaretUpOutlined, EnterOutlined } from '@ant-design/icons';
import {
  Input,
  InputNumber,
  DatePicker,
  TimePicker,
  Checkbox,
  Select,
  ColorPicker,
  Form,
  AutoComplete,
  Tag,
} from 'antd';

import 'dayjs/locale/ru';
import debounce from 'lodash/debounce';
import dayjs, { Dayjs } from 'dayjs';

import { Typography } from 'antd';
import { NavLink } from 'react-router-dom';

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

	// Контейнер для хранения различных списков по ключам
  const [transContainer, setTransContainer] = useState({});

	// Переменные для хранения параметра ввода в поле с автозаполнением
	// Применяется только к изменяемому полю (их может быть несколько) и на другие не влияет
	const [tempAutofill, setTempAutoFill] = useState('');
	const [tempAutofillKey, setTempAutoFillKey] = useState('');

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
			initialValues[props.comment.name] =
				props.comment.value !== undefined ? props.comment.value : null;
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
		if (!(field.type !== 'text' || field.type !== 'string' || field.type !== 'email' || field.type !== 'textarea') &&
      field.max !== undefined && newValue != null && newValue > field.max) {
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
        /** ---------------------------------------------------------------- */
				return <div className="sk-omt-content-formatted">{value ? 'Да' : 'Нет'}</div>;
			} else if (field.type === 'textarea') {
        /** ---------------------------------------------------------------- */
				return (
					<Typography.Paragraph
            className='sk-omt-content-color'
						style={{ whiteSpace: 'pre-line', display: 'block' }}
						ellipsis={false}
					>
						{String(value ?? (field.nullable ? '' : ''))}
					</Typography.Paragraph>
				);
			} else if (field.type === 'date') {
        /** ---------------------------------------------------------------- */
				return <div className="sk-omt-content-formatted">{ value === null ? "" : dayjs(value).format('DD.MM.YYYY')}</div>;
			} else if (field.type === 'datetime') {
        /** ---------------------------------------------------------------- */
				return (
					<div className="sk-omt-content-formatted">
						{dayjs(value).format('DD.MM.YYYY HH:mm:ss')}
					</div>
				);
			} else if (field.type === 'time') {
        /** ---------------------------------------------------------------- */
				return <div className="sk-omt-content-formatted">{dayjs(value).format('HH:mm:ss')}</div>;
        
			} else if (field.type === 'select') {
        /** ---------------------------------------------------------------- */
        
				let lab = field.options?.find((item) => item.value === field.value)?.label;
        if (field.link){
          return <NavLink target='blank' to={field.link + field.value}><div className="sk-omt-content-formatted"> {lab}</div></NavLink>;
        } else {
          return <div className="sk-omt-content-formatted">{lab}</div>;
        }
        
			} else if (field.type === 'multiselect') {
        /** ---------------------------------------------------------------- */
        if (field.link){
          return field.value?.map((item, index)=>(
            <NavLink target='blank' key={'fkljasdkfass_' + item + index}
             to={field.link + item}> <Tag color="#3b5999">{item} </Tag></NavLink>
          ));
        } else {
          
          return field.value.map((item, index)=>(
            <Tag key={'fkljasdkfasds_' + item + index} color="#3b5999">{item} </Tag>
          ));
        }
        
			}
			return (
        /** ---------------------------------------------------------------- */
				<div className="sk-omt-content-formatted">
					{String(value ?? (field.nullable ? '' : ''))}
				</div>
			);
		}

		const commonProps = {
			value,
			onChange: (e) => {
				const val = e?.target?.value ?? e;
				onChange(field.name, val, field);
			},
			disabled: false,
			style: { width: '100%' },
			onBlur: (e) => {
				// console.log('BLUR');

        if (props.on_blur){
          const val = e?.target?.value ?? e;
          let obj = {};
          obj[field.name] = val;
          props.on_blur(obj);
        }
      }
    };

		switch (field.type) {
			case 'string':
			case 'email':
				return (
					<Input
						variant={'borderless'}
						size="small"
						{...commonProps}
						type={field.type}
						placeholder={field.placeholder ? field.placeholder : isRequired ? 'Обязательно' : ''}
						allowClear={field.nullable}
						maxLength={field.max}
						required={field.required}
						// status="error"
						
					/>
				);

			case 'integer':
			case 'uinteger':
			case 'float':
			case 'ufloat':
				return (
					<InputNumber
						variant="borderless"
						size="small"
						{...commonProps}
						min={field.type.startsWith('u') ? 0 : field.min}
						max={field.max}
						precision={field.type.includes('float') ? 2 : 0}
						style={{ width: '100%' }}
						allowClear={field.nullable}
						placeholder={field.placeholder}
					/>
				);

			case 'textarea':
				return (
					<TextArea
						variant="borderless"
						size="small"
						allowClear={field.nullable}
						maxLength={field.max}
						placeholder={field.placeholder}
						{...commonProps}
						rows={3}
					/>
				);

			case 'date':
				return (
					<DatePicker
						size="small"
						variant="borderless"
						value={value ? dayjs(value) : null}
						format={'DD.MM.YYYY'}
						onChange={(date, dateString) => {
							let a = {};
							a[field.name] = date ? date.format('YYYY-MM-DD') : null;
							if (!props.on_blur && props.on_change) {
								props.on_change(a);
							}
							if (props.on_blur) {
								props.on_blur(a);
							}
						}}
						style={{ width: '100%' }}
						placeholder={field.placeholder}
					/>
				);

			case 'time':
				return (
					<TimePicker
						size="small"
						variant="borderless"
						value={value ? dayjs(value, 'HH:mm') : null}
						format={'HH:mm'}
						placeholder={field.placeholder}
						onChange={(date, dateString) => {
							let a = {};
							a[field.name] = date ? date.format('YYYY-MM-DD') : null;
							if (!props.on_blur && props.on_change) {
								props.on_change(a);
							}
							if (props.on_blur) {
								props.on_blur(a);
							}
						}}
					/>
				);

			case 'datetime':
				return (
					<DatePicker
						variant="borderless"
						size="small"
						showTime
						format={'DD.MM.YYYY HH:mm'}
						value={value ? dayjs(value) : null}
						style={{ width: '100%' }}
						placeholder={field.placeholder}
						onChange={(date, dateString) => {
							let a = {};
							a[field.name] = date ? date.format('YYYY-MM-DD') : null;
							if (!props.on_blur && props.on_change) {
								props.on_change(a);
							}
							if (props.on_blur) {
								props.on_blur(a);
							}
						}}
					/>
				);
 
			case 'checkbox':
				return (
					<Checkbox
            style={{paddingLeft: '12px'}}
						checked={!!value}
						onChange={(e) => onChange(field.name, e.target.checked, field)}
					>
						{field.title || 'Да/Нет'}
					</Checkbox>
				);

      case 'select':
        return (
          <Select
            allowClear={field.allowClear ? field.allowClear : false}
            showSearch={field.showSearch ? field.showSearch : false}
            optionFilterProp="children"
						
						onSearch={field?.on_search}
            size='small'
            variant="borderless"
            value={value}
            onChange={ (e) => {
              if (props.on_blur){
                const val = e || null;
				
                let obj = {};
                obj[field.name] = val;
				
                props.on_blur(obj);
              }else{
                  onChange(field.name, e, field)
              }
            }}
						
      
            style={{ width: '100%' }}

          >
            {field.options?.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        );

      case 'multiselect':
        return (
          <Select
            allowClear={field.allowClear ? field.allowClear : false}
            showSearch={field.showSearch ? field.showSearch : false}
            optionFilterProp="children"
            // optionFilterProp="label"
            //     filterSort={(optionA, optionB) =>
            //       (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
            //     }
						onSearch={field?.on_search}
            mode="multiple"
            size='small'
            variant="borderless"
            value={value}

            onChange={(val) => {
							if (props.on_change){
								let o = {};
								o[field.name] = val;
								
								props.on_change(o);
							}
						}}
            // onChange={(val) => console.log(val)}
            style={{ width: '100%' }}
            // onBlur={ (e) => {
            //   if (props.on_blur){
            //     const val = e?.target?.value ?? e;
            //     console.log(val);
            //     let obj = {};
            //     obj[field.name] = val;
            //     props.on_blur(obj);
            //   }
            // }}
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
						size="small"
						placeholder={field.placeholder}
						value={value}
						onChange={(color) => onChange(field.name, color.toHexString(), field)}
					/>
				);

      case 'autocomplete' :
        return (
          <AutoComplete
            options={transContainer[field.name]}
            style={{ width: '100%' }}
            size='small'
            variant="borderless"
			onClick={field?.onClick}
            onSearch={(text)=> {
              let filteredOptions = [];
              let cmod = transContainer;
              if (field.options && text !== null){
                filteredOptions = field.options?.filter(item =>
                  item.label.toLowerCase().includes(text?.toLowerCase())
                );
								// Список подгоняется в зависимости от того, что введено пользователем
                cmod[field.name] = filteredOptions?.map(obj => ({
                    key: obj.key,
                    value: obj.label,
                    label: obj.label,
                  }));
                  setTransContainer(cmod);
                } else {
                    cmod[field.name] = []
                  setTransContainer(cmod);
                }
              }}
							onBlur={(e)=>{

								const val = e?.target?.value ?? e;
                let obj = {};
                obj[field.name] = val?.trim();
                if (props.on_blur ){
                  props.on_blur(obj);
                }
							}}
            // onChange={handleChange}
            onChange={(e)=>{
              // console.log(e);
              const val = e?.target?.value ?? e;
							if (val !== tempAutofill){

								let obj = {};
								obj[field.name] = val;
								if (props.on_change){
									props.on_change(obj);
								}
								setTempAutoFill(val);
								setTempAutoFillKey(field.name);
							}
           
            }}
						// Как только что-то меняется в поле, его значение начинает браться не снаружи,
						// а из временного стейта, в ином случае будет слетать курсор
            value={tempAutofillKey === field.name ? tempAutofill : value}
            placeholder={field.placeholder}
            // allowClear
            notFoundContent="Ничего не найдено :("
            // {...commonProps}
          >
            <Input            
             size='small'
              variant="borderless"
              onChange={()=>{
              }}
               />
          </AutoComplete>
        )

      default:
        return <Input
        size='small'
         variant="borderless" {...commonProps} />;
    }
  };

	return (
		<div className={`sk-omt-row-wrapper ${editMode ? 'sk-omt-row-editor' : ''}`}>
			{/* Основная строка */}
			<div className={`sk-omt-row omt-${columns}-col`}>
				<div className={`${fields[0]?.required && !localValues[fields[0]?.name] ? 'sa-required-field-block' : ''}`}>
					<div className="sk-omt-legend sa-flex-space">
						<span style={{ paddingLeft: '6px' }}>
							{commentConfig && (
								<div className={`sk-omt-comment-trigger ${commentConfig?.value !== null && commentConfig?.value?.trim() !== "" ? "sk-omt-comment-trigger-treasure" : "" } ${commentConfig?.required === true && localValues[commentConfig?.name]?.trim() === "" ? "sk-omt-comment-trigger-hot" : "" }`} onClick={() => setOpened(!opened)}>
									<span>{opened ? <CaretUpOutlined /> : <CaretDownOutlined />}</span>
									<span >
                  {commentConfig.label ? commentConfig.label : 'комм'}
                  </span>
								</div>
							)}
						</span>
						<span>{titles[0]}</span>
					</div>

					{titles.length < 3 ? (
						fields[0]?.name ? (
              <>
                {(props.action && editMode && fields[1] === undefined) ? (
                  <div className="sk-omt-content sa-flex-space">
                    <span style={{width: '100%'}}>
                    {renderField(fields[0], localValues[fields[0].name], handleChange)}</span>
                    <span style={{paddingRight: '6px'}}>{props.action}</span>
                  </div>
                ):(
                  <div className="sk-omt-content">
                    {renderField(fields[0], localValues[fields[0].name], handleChange)}
                  </div>

                )}</>
						) : null
					) : (
						<div className="sk-omt-content-epanded">
							{fields[0]?.name && (

                  <div className="sk-omt-content">
                    {renderField(fields[0], localValues[fields[0].name], handleChange)}
                  </div>

							)}
							<div className="sk-omt-legend sa-flex-space">{titles[2]}</div>
							{fields[2]?.name && (
								<div className={`${fields[2]?.required  && !localValues[fields[2]?.name] ? 'sa-required-field-block' : ''}`}>
								<div className="sk-omt-content">
									{renderField(fields[2], localValues[fields[2].name], handleChange)}
								</div>
								</div>
							)}
						</div>
					)}
				</div>

				{titles.length > 1 && fields[1]?.name && (
					<div className={`${fields[1]?.required && !localValues[fields[1]?.name] ? 'sa-required-field-block' : ''}`}>
						<div className="sk-omt-legend sa-flex-space">
							<span></span>
							<span>{titles[1]}</span>
						</div>
            {(props.action && editMode) ? (
              <div className="sk-omt-content sa-flex-space">
                <span style={{width: '100%'}}>
                {renderField(fields[1], localValues[fields[1].name], handleChange)}</span>
                <span style={{paddingRight: '6px'}}>{props.action}</span>
              </div>
            ):(
              <div className="sk-omt-content">
                {renderField(fields[1], localValues[fields[1].name], handleChange)}
              </div>
            )}

					</div>
				)}
			</div>

			{/* Блок комментария */}
			{commentConfig && opened && (
				<div className="sk-omt-row omt-1-col">
					<div className={`${commentConfig?.required && !localValues[commentConfig?.name] ? 'sa-required-field-block' : ''}`}>
						<div className="sk-omt-legend sa-flex-space">
							<span className="sk-comment-arrow-sign">
								<EnterOutlined />
							</span>
							<span>
								<i>{commentConfig.label ? commentConfig.label : "Комментарий"}</i>
							</span>
						</div>
						<div className="sk-omt-content">
							{editMode ? (
								renderField(commentConfig, localValues[commentConfig.name], handleChange)
							) : (
								<Typography.Paragraph
									style={{ whiteSpace: 'pre-line', display: 'block' }}
									ellipsis={false}
								>
									{commentConfig.value || ''}
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

export const OPS_TYPE = {
  STRING : 'string',
  EMAIL  : 'email',
  INTEGER: 'integer',
  UINTEGER: 'uinteger',
  FLOAT:   'float',
  UFLOAT:   'ufloat',
  TEXTAREA: 'textarea',
  DATE     : 'date',
  TIME     : 'time',
  DATETIME : 'datetime',
  CHECKBOX : 'checkbox',
  SELECT   : 'select',
  MSELECT   : 'multiselect',
  COLOR    : 'color',
  AUTOCOMPLETE : 'autocomplete',
};
