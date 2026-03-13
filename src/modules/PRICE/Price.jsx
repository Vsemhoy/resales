import React, { useEffect, useState } from 'react';
import {PRODMODE, CSRF_TOKEN, ROUTE_PREFIX} from '../../config/config';
import dayjs from 'dayjs';
import './components/style/orgpage.css';
import {Tree, Button, Spin, Tag, Switch, Checkbox, Layout, Alert, Affix} from 'antd';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import {DS_CURRENCY, PRICE} from './mock/mock';
import './style/price_style.css'
import CurrencyMonitorBar from "../../components/template/CURRENCYMONITOR/CurrencyMonitorBar";
import {FilterOutlined} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import {Content, Header} from "antd/es/layout/layout";
import ExcelJS from 'exceljs';


const Price = (props) => {
    const [currency, setCurrency] = useState(null);
    const [treeData, setTreeData] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [smallLoading, setSmallLoading] = useState(false);
    const [currentCurrency, setCurrentCurrency] = useState(false);

    const [userData, setUserData] = useState(null);

    const [isOpenedFilters, setIsOpenedFilters] = useState(true);
    const defaultCheckedList = [
        {
            id: 0,
            name: 'РРЦ',
            checked: true,
        },
        {
            id: 1,
            name: 'Розница',
            checked: true,
        },
        {
            id: 2,
            name: 'Прайс 10',
            checked: true,
        },
        {
            id: 3,
            name: 'Прайс 20',
            checked: true,
        },
        {
            id: 4,
            name: 'Прайс 30',
            checked: true,
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
        setSmallLoading(true);
        const treeNodes = mapDataToTreeNodes(data);
        setTreeData(treeNodes);
        setTimeout(() => setSmallLoading(false), 500);
    }, [data, checkedList, currentCurrency]);
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
    //const convertToRub = (price, curr) => price * currency.company[curr].value;
    const getCurrencySymbol = (c) => {
        return currentCurrency ? '₽' : c === 0 ? '$' : '€';
    };
    const mapDataToTreeNodes = (data, parentKey = '') => {
        return data.map((item, index) => {
            const key = parentKey ? `${parentKey}-${index}-${item.id}` : `${index}-${item.id}`;
            const children = [];

            if (item.models) {
                item.models.forEach((model, mIndex) => {
                    console.log(model);
                    children.push({
                        key: `${key}-model-${mIndex}-${model.id}`,
                        title: (
                            <div className={'sa-price-option'}>
                                <div className={'sa-price-grid-cell'} style={{ alignItems: 'center' }}>
                                    {model.name}
                                </div>
                                <div className={'sa-price-grid-cell'}>{model.descr}</div>
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
                                                { currentCurrency ?
                                                    ((model.prices.bo_price_40_rub) / 100).toFixed(2) :
                                                    ((model.prices.bo_price_40) / 100).toFixed(2)
                                                }
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
                                                { currentCurrency ?
                                                    ((model.prices.bo_price_0_rub) / 100).toFixed(2) :
                                                    ((model.prices.bo_price_0) / 100).toFixed(2)
                                                }
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
                                                { currentCurrency ?
                                                    ((model.prices.bo_price_10_rub) / 100).toFixed(2) :
                                                    ((model.prices.bo_price_10) / 100).toFixed(2)
                                                }
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
                                                { currentCurrency ?
                                                    ((model.prices.bo_price_20_rub) / 100).toFixed(2) :
                                                    ((model.prices.bo_price_20) / 100).toFixed(2)
                                                }
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
                                                { currentCurrency ?
                                                    ((model.prices.bo_price_30_rub) / 100).toFixed(2) :
                                                    ((model.prices.bo_price_30) / 100).toFixed(2)
                                                }
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
                children.push(...mapDataToTreeNodes(item.childs, key));
            }

            return {
                key,
                title: (
                    <span>
						<b>{item.name}</b> {item.descr && `- ${item.descr}`}
					</span>
                ),
                children,
                dataRef: item,
            };
        });
    };

    const handleExport = async () => {
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

        const buildSections = (nodes, depth = 0) => {
            let sections = [];

            nodes.forEach((node) => {
                const hasSelectedModels = (n) => {
                    if (n.models?.some(m => checkedModelIds.includes(m.id))) return true;
                    return n.childs?.some(child => hasSelectedModels(child));
                };

                if (!hasSelectedModels(node)) return;

                const selectedModels = node.models?.filter(m => checkedModelIds.includes(m.id)) || [];

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

        const firstModel = sections.find(s => s.models.length > 0)?.models[0];
        const currencySymbol = firstModel ? getCurrencySymbol(firstModel.currency) : '';

        const checkCol = (key) => checkedList?.find(c => c.name === key)?.checked;

        const extraColumns = [];
        if (checkCol('РРЦ'))      extraColumns.push(`РРЦ ${currencySymbol}`);
        if (checkCol('Розница'))  extraColumns.push(`Розница ${currencySymbol}`);
        if (checkCol('Прайс 10')) extraColumns.push(`Прайс 10 ${currencySymbol}`);
        if (checkCol('Прайс 20')) extraColumns.push(`Прайс 20 ${currencySymbol}`);
        if (checkCol('Прайс 30')) extraColumns.push(`Прайс 30 ${currencySymbol}`);

        const allColumns = ['Название', 'Описание', ...extraColumns];
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

        // Заголовок
        const headerRow = ws.addRow(allColumns);
        headerRow.eachCell(cell => {
            cell.font = { bold: true, size: 18 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
            cell.border = borderStyle;
        });

        sections.forEach(({ categoryName, depth, models }) => {
            // Показываем только SUBCATEGORY (depth === 2), COMPANY и CATEGORY пропускаем
            if (depth < 2) return;

            // Название SUBCATEGORY выводим во второй столбец (Описание), первый оставляем пустым
            const catRow = ws.addRow(['', categoryName]);
            ws.mergeCells(catRow.number, 2, catRow.number, totalCols);
            const catCell = catRow.getCell(2);
            catCell.font = { bold: true, size: 18, color: { argb: 'FF333333' } };
            catCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                // Нейтральный светло-серый цвет
                fgColor: { argb: 'FFD6DCE4' }
            };
            catCell.alignment = { indent: 1 };
            catCell.border = borderStyle;
            catRow.getCell(1).border = borderStyle;

            models.forEach((m) => {
                const getPrice = (rub, val) =>
                    ((currentCurrency ? rub : val) / 100).toFixed(2);

                const rowData = [m.name, m.descr];
                if (checkCol('РРЦ'))      rowData.push(getPrice(m.prices.bo_price_40_rub, m.prices.bo_price_40));
                if (checkCol('Розница'))  rowData.push(getPrice(m.prices.bo_price_0_rub,  m.prices.bo_price_0));
                if (checkCol('Прайс 10')) rowData.push(getPrice(m.prices.bo_price_10_rub, m.prices.bo_price_10));
                if (checkCol('Прайс 20')) rowData.push(getPrice(m.prices.bo_price_20_rub, m.prices.bo_price_20));
                if (checkCol('Прайс 30')) rowData.push(getPrice(m.prices.bo_price_30_rub, m.prices.bo_price_30));

                const modelRow = ws.addRow(rowData);
                modelRow.font = { size: 16 };
                modelRow.eachCell(cell => {
                    cell.border = borderStyle;
                });
            });
        });

        // Автоширина колонок
        ws.columns.forEach((col, i) => {
            let maxLen = allColumns[i]?.length || 10;
            col.eachCell(cell => {
                const val = cell.value?.toString() || '';
                if (val.length > maxLen) maxLen = val.length;
            });
            const width = Math.min(maxLen + 2, 60);
            // Колонка "Описание" (индекс 1) — в два раза шире
            // Колонки цен (индексы 2-6) — фиксированная ширина 20
            if (i === 1) {
                col.width = width * 2;
            } else if (i >= 2) {
                col.width = Math.max(width, 20);
            } else {
                col.width = Math.max(width, 20);
            }
        });

        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dayjs().format('DD.MM.YYYY')}. Прайс_лист. ${currentCurrency ? 'Рубли' : 'Валюта'}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Spin tip="Загрузка прайс-листа..." spinning={loading}>
            <div className={'sa-price-page'}>
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
                                            <Button onClick={handleExport} type="primary">
                                                Экспортировать выбранное в Excel
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
                            width={'170px'}
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
                                            {checkedList.map((option, idx) => (
                                                <Checkbox onChange={(e) => onChangeCheckbox(e.target.checked, idx)}
                                                          checked={option.checked}
                                                >
                                                    {option.name}
                                                </Checkbox>
                                            ))}
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
