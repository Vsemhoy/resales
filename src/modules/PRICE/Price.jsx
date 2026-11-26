import React, { useEffect, useState } from 'react';
import {PRODMODE, CSRF_TOKEN, ROUTE_PREFIX} from '../../config/config';
import { useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import './components/style/orgpage.css';
import {Tree, Table, Button, Spin, Tag, Switch, Checkbox, InputNumber, Layout, Alert, Affix, Skeleton, Tooltip} from 'antd';
import { usePageTheme } from '../../context/PageThemeContext';
import './style/price-common.css';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import {DS_CURRENCY, PRICE} from './mock/mock';
import './style/price_style.css'
import CurrencyMonitorBar from "../../components/template/CURRENCYMONITOR/CurrencyMonitorBar";
import {FilterOutlined} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import {Content, Header} from "antd/es/layout/layout";
import ExcelJS from 'exceljs';
import PricePropertiesExportDialog from './PricePropertiesExportDialog';
import { getPriceModelPropertyValues } from './priceProperties.api';
import { applyPriceMarkup } from './priceMarkup';


const Price = (props) => {
    const isMainTheme = usePageTheme() === 'main';
    const [currency, setCurrency] = useState(null);
    const [treeData, setTreeData] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [smallLoading, setSmallLoading] = useState(false);
    const [currentCurrency, setCurrentCurrency] = useState(false);
    const [propertiesExportOpen, setPropertiesExportOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [tableViewport, setTableViewport] = useState({ width: 900, height: 400 });
    const priceTableContainerRef = useRef(null);
    const previousTreeDataRef = useRef(null);

    const [userData, setUserData] = useState(null);

    const [isOpenedFilters, setIsOpenedFilters] = useState(true);
    const defaultCheckedList = [
        {
            id: 0,
            name: 'РРЦ',
            checked: true,
            markup: 0,
        },
        {
            id: 1,
            name: 'Розница',
            checked: true,
            markup: 0,
        },
        {
            id: 2,
            name: 'Прайс 10',
            checked: true,
            markup: 0,
        },
        {
            id: 3,
            name: 'Прайс 20',
            checked: true,
            markup: 0,
        },
        {
            id: 4,
            name: 'Прайс 30',
            checked: true,
            markup: 0,
        },
    ];
    const [checkedList, setCheckedList] = useState(defaultCheckedList);
    const [data, setData] = useState([]);

    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertDescription, setAlertDescription] = useState('');
    const [alertType, setAlertType] = useState('');

    useEffect(() => {
        fetchFields().then();
        setCheckedList(defaultCheckedList);
    }, []);
    useEffect(() => {
        if (isMainTheme) {
            setSmallLoading(false);
            return undefined;
        }
        const dataChanged = previousTreeDataRef.current !== data;
        previousTreeDataRef.current = data;
        if (dataChanged) setSmallLoading(true);
        const treeNodes = mapDataToTreeNodes(data);
        setTreeData(treeNodes);
        if (!dataChanged) {
            setSmallLoading(false);
            return undefined;
        }
        const timer = setTimeout(() => setSmallLoading(false), 500);
        return () => clearTimeout(timer);
    }, [data, checkedList, currentCurrency, isMainTheme]);
    useEffect(() => {
        const container = priceTableContainerRef.current;
        if (!isMainTheme || !container || typeof ResizeObserver === 'undefined') return undefined;

        const updateTableViewport = () => {
            const nextViewport = {
                width: container.clientWidth,
                height: Math.max(120, container.clientHeight - 42),
            };
            setTableViewport((current) => current.width === nextViewport.width && current.height === nextViewport.height
                ? current
                : nextViewport);
        };

        const observer = new ResizeObserver(updateTableViewport);
        observer.observe(container);
        updateTableViewport();
        return () => observer.disconnect();
    }, [isMainTheme]);
    useEffect(() => {
        if (isAlertVisible && alertType !== 'error') {
            const timer = setTimeout(() => {
                setIsAlertVisible(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isAlertVisible]);
    useEffect(() => {
        if (props.userdata) {
            setUserData(props.userdata);
        }
    }, [props.userdata]);
    useEffect(() => {
        if (userData) {
            fetchCurrency().then();
        }
    }, [userData]);

    const fetchFields = async () => {
        if (PRODMODE) {
            const format_data = {
                _token: CSRF_TOKEN,
            };
            const path = `${ROUTE_PREFIX}/sales/price`;
            try {
                setLoading(true);
                let fields_req = await PROD_AXIOS_INSTANCE.post(path, format_data);
                if (fields_req) {
                    setData(fields_req.data.data[0].childs);
                }
                setLoading(false);
            } catch (e) {
                console.log(e);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
                setLoading(false);
            }
        } else {
            setData(PRICE.childs);
        }
    };
    const fetchCurrency = async () => {
        if (PRODMODE) {
            const path = `${ROUTE_PREFIX}/currency/getcurrency`;
            try {
                setLoading(true);
                const format_data = {
                    _token: CSRF_TOKEN,
                    data: {},
                };
                const currency_response = await PROD_AXIOS_INSTANCE.post(path, format_data);
                if (currency_response) {
                    const cur = currency_response.data;
                    if (cur?.company?.length > 0 && userData && cur?.company.find(c => (+c.id_company === +userData.user.id_company && c.charcode === 'USD'))) {
                        setCurrency(cur?.company.find(c => (+c.id_company === +userData.user.id_company && c.charcode === 'USD')).value);
                    } else if (cur?.currency?.length > 0) {
                        setCurrency(cur?.currency.find(c => (c.charcode === 'USD')).value);
                    }
                }
                setLoading(false);
            } catch (e) {
                console.log(e);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
                setLoading(false);
            }
        } else {
            if (DS_CURRENCY?.company?.length > 0 && userData && DS_CURRENCY?.company.find(c => (+c.id_company === +userData.user.id_company && c.charcode === 'USD'))) {
                setCurrency(DS_CURRENCY?.company.find(c => (+c.id_company === +userData.user.id_company && c.charcode === 'USD')).value);
            } else if (DS_CURRENCY?.currency?.length > 0) {
                setCurrency(DS_CURRENCY?.currency.find(c => (c.charcode === 'USD')).value);
            }
        }
    };

    const onChangeCheckbox = (checked, idx) => {
        const checkedListUpd = JSON.parse(JSON.stringify(checkedList));
        checkedListUpd[idx].checked = checked;
        setCheckedList(checkedListUpd);
    };
    const onChangeMarkup = (markup, idx) => {
        setCheckedList((previous) => previous.map((option, optionIndex) =>
            optionIndex === idx ? { ...option, markup } : option));
    };
    const getAdjustedPrice = (priceMinor, optionId) =>
        applyPriceMarkup(priceMinor, checkedList.find((option) => option.id === optionId)?.markup);
    const renderPriceControl = (option, idx) => (
        <div className="sa-price-markup-row" key={option.id}>
            <Checkbox checked={option.checked} onChange={(event) => onChangeCheckbox(event.target.checked, idx)}>
                {option.name}
            </Checkbox>
            <div className="sa-price-markup-field">
                <InputNumber
                    className="sa-price-markup-input"
                    size="small"
                    min={0}
                    precision={2}
                    controls={false}
                    value={option.markup}
                    placeholder="0"
                    onChange={(value) => onChangeMarkup(value, idx)}
                    aria-label={`Наценка ${option.name}, процентов`}
                />
                <span aria-hidden="true">%</span>
            </div>
        </div>
    );
    //const convertToRub = (price, curr) => price * currency.company[curr].value;
    const getCurrencySymbol = (c) => {
        return currentCurrency ? '₽' : c === 0 ? '$' : '€';
    };
    const mapDataToTreeNodes = (data, parentKey = '', level = 0) => {
        return data.map((item, index) => {
            const key = parentKey ? `${parentKey}-${index}-${item.id}` : `${index}-${item.id}`;
            const children = [];

            if (item.models) {
                item.models.forEach((model, mIndex) => {
                    children.push({
                        key: `${key}-model-${mIndex}-${model.id}`,
                        title: (
                            <div className={'sa-price-option'}>
                                <div className={'sa-price-grid-cell'} style={{ alignItems: 'center' }}>
                                    {model.name}
                                </div>
                                <div className={'sa-price-grid-cell sa-price-description-cell'}>
                                    <Tooltip title={model.descr || null} placement="topLeft">
                                        <span className="sa-price-description-text">{model.descr}</span>
                                    </Tooltip>
                                </div>
                                {checkedList.find((c) => c.id === 0)?.checked && (
                                    <div className={'sa-price-tag'}>
                                        <Tag
                                            style={{
                                                width: '100%',
                                                display: 'inline-block',
                                                textAlign: 'center',
                                                lineHeight: '29px',
                                            }}
                                        >
                                            РРЦ:{' '}
                                            <Tag  color={'geekblue'}>
                                                {getAdjustedPrice(currentCurrency ? model.prices.bo_price_40_rub : model.prices.bo_price_40, 0).toFixed(2)}
                                                {getCurrencySymbol(model.currency)}
                                            </Tag>
                                        </Tag>
                                    </div>
                                )}
                                {checkedList.find((c) => c.id === 1)?.checked && (
                                    <div className={'sa-price-tag'}>
                                        <Tag
                                            style={{
                                                width: '100%',
                                                display: 'inline-block',
                                                textAlign: 'center',
                                                lineHeight: '29px',
                                            }}
                                        >
                                            Розница:{' '}
                                            <Tag color={'blue'}>
                                                {getAdjustedPrice(currentCurrency ? model.prices.bo_price_0_rub : model.prices.bo_price_0, 1).toFixed(2)}
                                                {getCurrencySymbol(model.currency)}
                                            </Tag>
                                        </Tag>
                                    </div>
                                )}
                                {checkedList.find((c) => c.id === 2)?.checked && (
                                    <div className={'sa-price-tag'}>
                                        <Tag
                                            style={{
                                                width: '100%',
                                                display: 'inline-block',
                                                textAlign: 'center',
                                                lineHeight: '29px',
                                            }}
                                        >
                                            Прайс 10:{' '}
                                            <Tag color={'green'}>
                                                {getAdjustedPrice(currentCurrency ? model.prices.bo_price_10_rub : model.prices.bo_price_10, 2).toFixed(2)}
                                                {getCurrencySymbol(model.currency)}
                                            </Tag>
                                        </Tag>
                                    </div>
                                )}
                                {checkedList.find((c) => c.id === 3)?.checked && (
                                    <div className={'sa-price-tag'}>
                                        <Tag
                                            style={{
                                                width: '100%',
                                                display: 'inline-block',
                                                textAlign: 'center',
                                                lineHeight: '29px',
                                            }}
                                        >
                                            Прайс 20:{' '}
                                            <Tag color={'gold'}>
                                                {getAdjustedPrice(currentCurrency ? model.prices.bo_price_20_rub : model.prices.bo_price_20, 3).toFixed(2)}
                                                {getCurrencySymbol(model.currency)}
                                            </Tag>
                                        </Tag>
                                    </div>
                                )}
                                {checkedList.find((c) => c.id === 4)?.checked && (
                                    <div className={'sa-price-tag'}>
                                        <Tag
                                            style={{
                                                width: '100%',
                                                display: 'inline-block',
                                                textAlign: 'center',
                                                lineHeight: '29px',
                                            }}
                                        >
                                            Прайс 30:{' '}
                                            <Tag color={'volcano'}>
                                                {getAdjustedPrice(currentCurrency ? model.prices.bo_price_30_rub : model.prices.bo_price_30, 4).toFixed(2)}
                                                {getCurrencySymbol(model.currency)}
                                            </Tag>
                                        </Tag>
                                    </div>
                                )}
                            </div>
                        ),
                        isLeaf: true,
                        dataRef: model,
                    });
                });
            }

            if (item.childs) {
                children.push(...mapDataToTreeNodes(item.childs, key, level + 1));
            }

            return {
                key,
                title: (
                    <span className={`sa-price-category sa-price-category-level-${level}`}>
						<span className="sa-price-category-label">
							<b>{item.name}</b> {item.descr && `- ${item.descr}`}
						</span>
						<span className="sa-price-category-count">
							{item.childs?.length
								? `Подкатегорий: ${item.childs.length}`
								: `Моделей: ${item.models?.length ?? 0}`}
						</span>
					</span>
                ),
                children,
                dataRef: item,
            };
        });
    };

    const priceTableRows = useMemo(() => {
        const mapRows = (items, parentKey = '', level = 0) => (items || []).map((item, index) => {
            const key = parentKey ? `${parentKey}-${index}-${item.id}` : `${index}-${item.id}`;
            const modelRows = (item.models || []).map((model, modelIndex) => ({
                ...model,
                key: `${key}-model-${modelIndex}-${model.id}`,
                rowType: 'model',
                level: level + 1,
            }));
            const categoryRows = mapRows(item.childs || [], key, level + 1);
            const children = [...modelRows, ...categoryRows];

            return {
                key,
                rowType: 'category',
                level,
                categoryName: item.name,
                categoryDescr: item.descr,
                subcategoryCount: item.childs?.length || 0,
                modelCount: item.models?.length || 0,
                ...(children.length ? { children } : {}),
            };
        });
        return mapRows(data);
    }, [data]);
    const visiblePriceOptions = checkedList.filter((option) => option.checked);
    const priceTableColumnCount = visiblePriceOptions.length + 2;
    const priceDefinitions = [
        { id: 0, label: 'РРЦ', price: 'bo_price_40', rub: 'bo_price_40_rub', color: '#2f54eb' },
        { id: 1, label: 'Розница', price: 'bo_price_0', rub: 'bo_price_0_rub', color: '#1677ff' },
        { id: 2, label: 'Прайс 10', price: 'bo_price_10', rub: 'bo_price_10_rub', color: '#389e0d' },
        { id: 3, label: 'Прайс 20', price: 'bo_price_20', rub: 'bo_price_20_rub', color: '#d48806' },
        { id: 4, label: 'Прайс 30', price: 'bo_price_30', rub: 'bo_price_30_rub', color: '#d4380d' },
    ];
    const priceTableColumns = useMemo(() => [
        {
            title: 'Модель',
            dataIndex: 'name',
            key: 'name',
            width: 170,
            onCell: (record) => record.rowType === 'category' ? { colSpan: priceTableColumnCount } : {},
            render: (name, record) => record.rowType === 'category' ? (
                <div className="sa-price-category-table-title">
                    <span className="sa-price-category-table-label">
                        <b>{record.categoryName}</b>{record.categoryDescr && ` - ${record.categoryDescr}`}
                    </span>
                    <span className="sa-price-category-table-count">
                        {record.subcategoryCount
                            ? `Подкатегорий: ${record.subcategoryCount}`
                            : `Моделей: ${record.modelCount}`}
                    </span>
                </div>
            ) : <span className="sa-price-model-name" style={{ paddingLeft: `${record.level * 18}px` }}>{name}</span>,
        },
        {
            title: 'Описание',
            dataIndex: 'descr',
            key: 'descr',
            width: 360,
            onCell: (record) => record.rowType === 'category' ? { colSpan: 0 } : {},
            render: (descr, record) => record.rowType === 'category' ? null : (
                <Tooltip title={descr || null} placement="topLeft">
                    <span className="sa-price-table-description">{descr}</span>
                </Tooltip>
            ),
        },
        ...priceDefinitions.filter((definition) => visiblePriceOptions.some((option) => option.id === definition.id)).map((definition) => ({
            title: definition.label,
            key: definition.label,
            width: 160,
            onCell: (record) => record.rowType === 'category' ? { colSpan: 0 } : {},
            render: (_, record) => {
                if (record.rowType === 'category') return null;
                const rawPrice = currentCurrency ? record.prices?.[definition.rub] : record.prices?.[definition.price];
                const formattedPrice = getAdjustedPrice(rawPrice, definition.id);
                return (
                    <span className="sa-price-table-price">
                        <span>{definition.label}:</span>
                        <span style={{ color: definition.color }}>{formattedPrice.toFixed(2)}{getCurrencySymbol(record.currency)}</span>
                    </span>
                );
            },
        })),
    ], [checkedList, currentCurrency]);

    const handleExport = async (selectedProperties = null) => {
        if (exporting) return;
        if (checkedKeys.length === 0) {
            setIsAlertVisible(true);
            setAlertMessage('Внимание!');
            setAlertDescription('Выберите хотя бы один элемент для экспорта');
            setAlertType('warning');
            return;
        }

        const checkedModelIds = checkedKeys
            .filter(key => key.includes('model'))
            .map(key => parseInt(key.split('-').pop()));
        const checkedModelIdSet = new Set(checkedModelIds);

        const buildSections = (nodes, depth = 0) => {
            let sections = [];

            nodes.forEach((node) => {
                const hasSelectedModels = (n) => {
                    if (n.models?.some(m => checkedModelIdSet.has(m.id))) return true;
                    return n.childs?.some(child => hasSelectedModels(child));
                };

                if (!hasSelectedModels(node)) return;

                const selectedModels = node.models?.filter(m => checkedModelIdSet.has(m.id)) || [];

                if (selectedModels.length > 0) {
                    sections.push({ categoryName: node.name, depth, models: selectedModels });
                } else {
                    sections.push({ categoryName: node.name, depth, models: [] });
                }

                if (node.childs?.length > 0) {
                    sections = sections.concat(buildSections(node.childs, depth + 1));
                }
            });

            return sections;
        };




        
        const sections = buildSections(data);

        if (!sections.some(s => s.models.length > 0)) {
            setIsAlertVisible(true);
            setAlertMessage('Внимание!');
            setAlertDescription('Выбранные элементы не содержат моделей для экспорта');
            setAlertType('warning');
            return;
        }

        setExporting(true);
        try {
        const withProperties = Array.isArray(selectedProperties);
        const properties = withProperties ? selectedProperties : [];
        const propertyValues = withProperties
            ? await getPriceModelPropertyValues({
                modelIds: checkedModelIds,
                propertyIds: properties.map(property => Number(property.id)),
            })
            : new Map();

        const firstModel = sections.find(s => s.models.length > 0)?.models[0];
        const currencySymbol = firstModel ? getCurrencySymbol(firstModel.currency) : '';

        const checkCol = (key) => checkedList?.find(c => c.name === key)?.checked;

        const extraColumns = [];
        if (checkCol('РРЦ'))      extraColumns.push(`РРЦ ${currencySymbol}`);
        if (checkCol('Розница'))  extraColumns.push(`Перепродажа ${currencySymbol}`);
        if (checkCol('Прайс 10')) extraColumns.push(`Проектная ${currencySymbol}`);
        if (checkCol('Прайс 20')) extraColumns.push(`Прайс 20 ${currencySymbol}`);
        if (checkCol('Прайс 30')) extraColumns.push(`Прайс 30 ${currencySymbol}`);

        const propertyLabels = properties.map(property =>
            property.dimension ? `${property.name}, ${property.dimension}` : property.name
        );
        const labelCounts = new Map();
        [...extraColumns, ...propertyLabels].forEach(label =>
            labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1)
        );
        const propertyColumns = propertyLabels.map((label, index) =>
            labelCounts.get(label) > 1 ? `${label} [#${properties[index].id}]` : label
        );
        const propertyWidths = propertyColumns.map(label => label.length);
        const allColumns = ['Название', 'Описание', ...extraColumns, ...propertyColumns];
        const totalCols = allColumns.length;

        //const ExcelJS = (await import('exceljs')).default;
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Прайс');

        const borderStyle = {
            top:    { style: 'thin', color: { argb: 'FF000000' } },
            left:   { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right:  { style: 'thin', color: { argb: 'FF000000' } },
        };
        const borderStyle2 = {
            top:    { style: 'none', color: { argb: 'FF000000' } },
            left:   { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'none', color: { argb: 'FF000000' } },
            right:  { style: 'thin', color: { argb: 'FF000000' } },
        };

        const borderStyleLast = {
            top:    { style: 'none', color: { argb: 'FF000000' } },
            left:   { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'double', color: { argb: 'FF000000' } },
            right:  { style: 'thin', color: { argb: 'FF000000' } },
        };

        // Padding
        for (let i = 0; i < 7; i++) {
            ws.addRow([]);
        }
        
        const titleRow = ws.addRow(['Прайс лист от 07.05.2020']);
        ws.mergeCells(titleRow.number, 1, titleRow.number, totalCols);
        
        const titleCell = titleRow.getCell(1);
        titleCell.value = 'Прайс лист от ' + dayjs().format('DD.MM.YYYY');
        titleCell.font = { bold: true, size: 11 };  // жирный + размер шрифта
        titleCell.alignment = { horizontal: 'center' };  // по центру
        
        ws.addRow([]);


        const activeCompanyId = props.userdata?.user?.active_company;
        try {
            const response = await fetch(parseInt(activeCompanyId) === 3 ? '/price_hat_rondo.png' : '/price_hat_arstel.png');
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const imageId = wb.addImage({
                    buffer: arrayBuffer,
                    extension: 'png',
                });
                ws.addImage(imageId, {
                    tl: { col: 0, row: parseInt(activeCompanyId) === 3 ? 1 : 2 },
                    br: { col: 4, row: 7 },
                });
            } else {
                console.error('Image fetch failed:', response.status, response.statusText);
            }
        } catch (e) {
            console.error('Image insert failed:', e);
        }

        
        let lastRow = null;
        sections.forEach(({ categoryName, depth, models }) => {
            // Пропускаем только пустые верхние ветки, но выгружаем модели на любом уровне.
            if (depth < 2 && models.length === 0) return;

            // Название категории выводим во второй столбец, первый оставляем пустым.
            const catRow = ws.addRow([categoryName.trim(), '', ...extraColumns, ...propertyColumns]);
            ws.mergeCells(catRow.number, 1, catRow.number, 2);


            catRow.eachCell(cell => {
                cell.font = { 
                // family: 'Arial',     // ← задаём Arial
                bold: true,          // жирный
                size: 9             // размер
            };
            cell.style.font.name = ('Arial');
            // cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
            cell.border = borderStyle;

            const catCell = catRow.getCell(2);
            catCell.font = { bold: true, size: 11, color: { argb: 'FF333333' } };
            catCell.style.font.name = ('Arial');

            catCell.border = borderStyle;
            catRow.getCell(1).border = borderStyle;
        });
        
        models.forEach((m) => {
            const getPrice = (rub, val, optionId) =>
                getAdjustedPrice(currentCurrency ? rub : val, optionId);

                if (m.name || m.name.trim() !== ''){
                    const rowData = [m.name, m.descr];
                    if (checkCol('РРЦ'))      rowData.push(getPrice(m.prices.bo_price_40_rub, m.prices.bo_price_40, 0));
                    if (checkCol('Розница'))  rowData.push(getPrice(m.prices.bo_price_0_rub,  m.prices.bo_price_0, 1));
                    if (checkCol('Прайс 10')) rowData.push(getPrice(m.prices.bo_price_10_rub, m.prices.bo_price_10, 2));
                    if (checkCol('Прайс 20')) rowData.push(getPrice(m.prices.bo_price_20_rub, m.prices.bo_price_20, 3));
                    if (checkCol('Прайс 30')) rowData.push(getPrice(m.prices.bo_price_30_rub, m.prices.bo_price_30, 4));
                    const modelProperties = propertyValues.get(Number(m.id));
                    properties.forEach((property, index) => {
                        const value = modelProperties?.get(Number(property.id)) ?? '';
                        rowData.push(value);
                        propertyWidths[index] = Math.max(propertyWidths[index], String(value).length);
                    });
                    
                    const modelRow = ws.addRow(rowData);
                    modelRow.font = { size: 11 };
                    modelRow.eachCell((cell, i) => {
                        cell.border = borderStyle2;
                        if (i > 2 && i <= 2 + extraColumns.length){
                            cell.numFmt = currentCurrency ? '#,##0.00 "₽"' : '$ #,##0.00';
                        }
                        });
                    if (withProperties) {
                        for (let column = 3 + extraColumns.length; column <= totalCols; column++) {
                            modelRow.getCell(column).border = borderStyle2;
                        }
                    }
                        lastRow = modelRow;
                    
                }
            });

        });

        lastRow?.eachCell(cell => {
            cell.border = borderStyleLast;
        });
        if (withProperties && lastRow) {
            for (let column = 1; column <= totalCols; column++) {
                lastRow.getCell(column).border = borderStyleLast;
            }
        }

        // Фиксированная ширина колонок
        ws.columns = withProperties ? [
            { width: 168 / 8 },
            { width: 448 / 8 },
            ...extraColumns.map(() => ({ width: 120 / 8 })),
            ...propertyWidths.map(width => ({ width: Math.min(80, Math.max(18, width + 2)) })),
        ] : [
            { width: 168 / 8 },  // Название (128px)
            { width: 448 / 8 },  // Описание (448px)
            { width: 120 / 8 },   // РРЦ (64px)
            { width: 120 / 8 },   // Розница (64px)
            { width: 120 / 8 },   // Прайс 10 (64px)
            { width: 120 / 8 },   // Прайс 20 (64px)
            { width: 120 / 8 }    // Прайс 30 (64px)
        ];

        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dayjs().format('DD.MM.YYYY')}. Прайс_лист${withProperties ? ' со свойствами' : ''}. ${currentCurrency ? 'Рубли' : 'Валюта'}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        if (withProperties) setPropertiesExportOpen(false);
        } catch (error) {
            console.error('Price export error:', error);
            setIsAlertVisible(true);
            setAlertMessage('Не удалось выгрузить прайс-лист');
            setAlertDescription(error.response?.data?.message || error.message || 'Ошибка выгрузки');
            setAlertType('error');
        } finally {
            setExporting(false);
        }
    };

    const openPropertiesExport = () => {
        if (!checkedKeys.some(key => key.includes('model'))) {
            setIsAlertVisible(true);
            setAlertMessage('Внимание!');
            setAlertDescription('Выберите хотя бы одну модель для экспорта');
            setAlertType('warning');
            return;
        }
        setPropertiesExportOpen(true);
    };

    if (isMainTheme) return (
        <div className="sa-price-common">
            <div className="sa-price-common-toolbar">
                <Button type="primary" icon={<FilterOutlined />} onClick={() => setIsOpenedFilters(!isOpenedFilters)} aria-expanded={isOpenedFilters}>Фильтры</Button>
                <h1>Прайс-лист</h1>
                <div className="sa-price-common-actions">
                    <Button type="primary" loading={exporting} onClick={() => handleExport()}>Экспорт в Excel</Button>
                    <Button disabled={exporting} onClick={openPropertiesExport}>Экспорт со свойствами</Button>
                </div>
            </div>
            <div className="sa-price-common-layout">
                {isOpenedFilters && <aside className="sa-price-common-filters">
                    <div className="sa-price-common-heading">Фильтры прайса</div>
                    <div className="sa-price-common-filter-fields">
                        <span>Колонки цен</span>
                        {checkedList.map(renderPriceControl)}
                        <span>Валюта отображения</span>
                        <Switch checked={currentCurrency} checkedChildren="Рубли" unCheckedChildren="Валюта" onChange={setCurrentCurrency} />
                    </div>
                </aside>}
                <div className="sa-price-common-table" ref={priceTableContainerRef}>
                    {loading || smallLoading ? <div className="sa-price-common-skeleton">{Array.from({length: 20}, (_, index) => <Skeleton.Input key={index} active block size="small" />)}</div> :
                        <Table
                            className="sa-price-data-table"
                            size="small"
                            virtual
                            tableLayout="fixed"
                            columns={priceTableColumns}
                            dataSource={priceTableRows}
                            rowKey="key"
                            pagination={false}
                            scroll={{
                                x: Math.max(tableViewport.width, 570 + 160 * visiblePriceOptions.length),
                                y: tableViewport.height,
                            }}
                            rowSelection={{
                                selectedRowKeys: checkedKeys,
                                checkStrictly: false,
                                columnWidth: 40,
                                onChange: (keys) => setCheckedKeys(keys),
                            }}
                            expandable={{ defaultExpandAllRows: false, indentSize: 18, expandRowByClick: true }}
                            rowClassName={(record) => record.rowType === 'category'
                                ? `sa-price-category-row sa-price-category-row-level-${record.level}`
                                : 'sa-price-model-row'}
                        />}
                </div>
            </div>
            {propertiesExportOpen && <PricePropertiesExportDialog userId={props.userdata?.user?.id} modelCount={checkedKeys.filter(key => key.includes('model')).length} exporting={exporting} onClose={() => setPropertiesExportOpen(false)} onExport={handleExport} />}
            {isAlertVisible && <Alert className="sa-price-common-alert" message={alertMessage} description={alertDescription} type={alertType} showIcon closable onClose={() => setIsAlertVisible(false)} />}
        </div>
    );

    return (
        <Spin tip="Загрузка прайс-листа..." spinning={loading}>
            <div className={'sa-price-page'}>
                {propertiesExportOpen && (
                    <PricePropertiesExportDialog
                        userId={props.userdata?.user?.id}
                        modelCount={checkedKeys.filter(key => key.includes('model')).length}
                        exporting={exporting}
                        onClose={() => setPropertiesExportOpen(false)}
                        onExport={handleExport}
                    />
                )}
                <Layout className={'sa-layout sa-w-100'}>
                    <Affix>
                        <Header style={{
                            padding: '0',
                            paddingBottom: '10px',
                            backgroundColor: '#b4c9e1',
                        }}>
                            <div className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}>
                                <div className={'sa-header-label-container'}>
                                    <div className={'sa-header-label-container-small'}>
                                        <h1 className={'sa-header-label'} style={{textAlign: 'left'}}>Прайс-лист</h1>
                                        <div>
                                            <CurrencyMonitorBar/>
                                        </div>
                                    </div>
                                    <div className={'sa-header-label-container-small'}>
                                        <div className={'sa-vertical-flex'}>
                                            <Button onClick={() => handleExport()} type="primary" loading={exporting}>
                                                Экспортировать выбранное в Excel
                                            </Button>
                                            <Button onClick={openPropertiesExport} disabled={exporting}>
                                                Экспорт со свойствами
                                            </Button>
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'end'}}>
                                            <Button
                                                onClick={() => {
                                                    setIsOpenedFilters(!isOpenedFilters);
                                                }}
                                                className={`${
                                                    isOpenedFilters
                                                        ? 'sa-default-solid-btn-color'
                                                        : 'sa-default-outlined-btn-color'
                                                }`}
                                                color={'default'}
                                                variant={isOpenedFilters ? 'solid' : 'outlined'}
                                                icon={<FilterOutlined/>}
                                            >
                                                Доп Фильтры
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Header>
                    </Affix>

                    <Layout className={'sa-layout sa-w-100'}>
                        <Content>
                            <div className={'sa-price-tree-container'}>
                                <Spin spinning={smallLoading}>
                                    <Tree
                                        checkable
                                        selectable={false}
                                        treeData={treeData}
                                        checkedKeys={checkedKeys}
                                        onCheck={(keys) => setCheckedKeys(keys)}
                                    />
                                </Spin>
                            </div>
                        </Content>

                        <Sider
                            collapsed={!isOpenedFilters}
                            collapsedWidth={0}
                            width={'220px'}
                            style={{
                                backgroundColor: '#ffffff',
                                overflow: 'hidden',
                                position: 'sticky',
                                top: '100px',
                                zIndex: 1
                            }}
                        >
                            <Affix offsetTop={140}>
                                <div className={'sa-sider'}>
                                    {isOpenedFilters && (
                                        <div className={'sa-price-sider'}>
                                            {checkedList.map(renderPriceControl)}
                                            <Switch
                                                checkedChildren="Рубли"
                                                unCheckedChildren="Валюта"
                                                onChange={(_) => setCurrentCurrency((prev) => !prev)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Affix>
                        </Sider>
                    </Layout>
                </Layout>
                {isAlertVisible && (
                    <Alert
                        message={alertMessage}
                        description={alertDescription}
                        type={alertType}
                        showIcon
                        closable
                        style={{
                            position: 'fixed',
                            top: 20,
                            right: 20,
                            zIndex: 9999,
                            width: 350,
                        }}
                        onClose={() => setIsAlertVisible(false)}
                    />
                )}
            </div>
        </Spin>
    );
};

export default Price;
