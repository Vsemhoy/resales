import React, { useEffect, useMemo, useState } from 'react';

import { PRODMODE, CSRF_TOKEN } from '../../config/config';

import dayjs from 'dayjs';
import './components/style/orgpage.css';

import { Tree, Button, Spin, message, Table, Tag, Switch, Divider, Checkbox } from 'antd';
import axios from 'axios';
import * as XLSX from 'xlsx';

import style from './style/price.module.css';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import {DS_CURRENCY, PRICE} from './mock/mock';

import './style/price_style.css'

const Price = () => {
	const defaultCheckedList = ['Предпродажа', 'Проектная', 'Прайс 20', 'Прайс 30'];
	const [checkedList, setCheckedList] = useState(defaultCheckedList);
	const [currency, setCurrency] = useState(PRODMODE ? null : DS_CURRENCY);
	const [treeData, setTreeData] = useState([]);
	const [checkedKeys, setCheckedKeys] = useState([]);
	const [loading, setLoading] = useState(PRODMODE);
	const [currentCurrency, setCurrentCurrency] = useState(false);
	const CheckboxGroup = Checkbox.Group;
	const plainOptions = ['Предпродажа', 'Проектная', 'Прайс 20', 'Прайс 30'];
	const indeterminate = checkedList.length > 0 && checkedList.length < plainOptions.length;
	const checkAll = plainOptions.length === checkedList.length;
	const onChange = (list) => {
		setCheckedList(list);
	};
	const [data, setData] = useState([]);
	const convertToRub = (price, curr) => price * currency.company[curr].value;
	const getCurrencySimbol = (c) => {
		return currentCurrency ? '₽' : c === 0 ? '$' : '€';
	};
	function mapDataToTreeNodes(data, parentKey = '') {
		const columns = [
			{
				key: 'name',
				dataIndex: 'name',
				width: 60,
				render: (e) => <div style={{ minWidth: '60px' }}>{e}</div>,
			},
			{
				key: 'descr',
				dataIndex: 'descr',
				render: (e) => <div style={{ minWidth: '400px' }}>{e}</div>,
				width: 300,
			},
			{
				key: 'price_0',
				dataIndex: 'price_0',
				hidden: checkedList && !checkedList.includes('Предпродажа'),
				render: (e, v) => (
					<div className={style.price__tag}>
						<Tag
							color={'green'}
							style={{
								width: 150,
								display: 'inline-block',
								textAlign: 'center',
							}}
						>
							Предпродажа:{' '}
							<span style={{ background: '#fff', fontWeight: 600 }}>
								{currentCurrency ? convertToRub(e, v.currency) : e}
								{getCurrencySimbol(v.currency)}
							</span>
						</Tag>
					</div>
				),
				width: 160,
				align: 'left',
			},
			{
				key: 'price_10',
				hidden: checkedList && !checkedList.includes('Проектная'),
				dataIndex: 'price_10',
				render: (e, v) => (
					<div className={style.price__tag}>
						<Tag
							color={'geekblue'}
							style={{
								width: 150,
								display: 'inline-block',
								textAlign: 'center',
							}}
						>
							Проектная:{' '}
							<span style={{ background: '#fff', fontWeight: 600 }}>
								{currentCurrency ? convertToRub(e, v.currency) : e}
								{getCurrencySimbol(v.currency)}
							</span>
						</Tag>
					</div>
				),
				width: 160,
				align: 'left',
			},
			{
				key: 'price_20',
				hidden: checkedList && !checkedList.includes('Прайс 20'),
				dataIndex: 'price_20',
				render: (e, v) => (
					<div className={style.price__tag}>
						<Tag
							color={'gold'}
							style={{
								width: 150,
								display: 'inline-block',
								textAlign: 'center',
							}}
						>
							Прайс 20:{' '}
							<span style={{ background: '#fff', fontWeight: 600 }}>
								{currentCurrency ? convertToRub(e, v.currency) : e}
								{getCurrencySimbol(v.currency)}
							</span>
						</Tag>
					</div>
				),
				width: 160,
				align: 'left',
			},
			{
				key: 'price_30',
				hidden: checkedList && !checkedList.includes('Прайс 30'),
				dataIndex: 'price_30',
				render: (e, v) => (
					<div className={style.price__tag}>
						<Tag
							color={'volcano'}
							style={{
								width: 150,
								display: 'inline-block',
								textAlign: 'center',
							}}
						>
							Прайс 30:{' '}
							<span style={{ background: '#fff', fontWeight: 600 }}>
								{currentCurrency ? convertToRub(e, v.currency) : e}
								{getCurrencySimbol(v.currency)}
							</span>
						</Tag>
					</div>
				),
				width: 160,
				align: 'left',
			},
		];
		return data.map((item, index) => {
			const key = parentKey ? `${parentKey}-${index}-${item.id}` : `${index}-${item.id}`;
			const children = [];

			if (item.models) {
				item.models.forEach((model, mIndex) => {
					children.push({
						key: `${key}-model-${mIndex}-${model.id}`,
						title: (
							<span>
								<Table
									columns={columns}
									dataSource={[{ ...model, ...model.prices }]}
									pagination={false}
									size={'small'}
									showHeader={false}
								/>{' '}
							</span>
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
	}

	useEffect(() => {
		const get_fields = async () => {
			if (PRODMODE) {
				const format_data = {
					_token: CSRF_TOKEN,
				};
				try {
					setLoading(true);
					let fields_req = await PROD_AXIOS_INSTANCE.post(`api/sales/price`, format_data);
					if (fields_req) {
						setData(fields_req.data.data[0].childs);
					}
				} catch (e) {
					console.log(e);
				} finally {
					setLoading(false);
				}
			} else {
				setData(PRICE.childs);
			}
		};
		const get_currency = async () => {
			if (PRODMODE) {
				try {
					setLoading(true);
					const format_data = {
						_token: CSRF_TOKEN,
						data: {},
					};
					const currency_response = await PROD_AXIOS_INSTANCE.post(
						`api/currency/getcurrency`,
						format_data
					);
					if (currency_response) {
						setCurrency(currency_response.data);
					}
				} catch (e) {
					console.log(e);
				} finally {
					setLoading(false);
				}
			}
		};
		get_fields().then();
		get_currency().then();
	}, []);

	useEffect(() => {
		const treeNodes = mapDataToTreeNodes(data);
		setTreeData(treeNodes);
	}, [data, checkedList, currentCurrency]);

	// Экспорт выбранных моделей в Excel
	const handleExport = () => {
		if (checkedKeys.length === 0) {
			message.warning('Выберите хотя бы один элемент для экспорта');
			return;
		}

		// Функция для поиска моделей по ключам в исходных данных
		const findModelsByKeys = (nodes, keys) => {
			let models = [];
			nodes.forEach((node) => {
				if (node.isLeaf && keys.includes(node.key)) {
					models.push(node.dataRef);
				}
				if (node.children) {
					models = models.concat(findModelsByKeys(node.children, keys));
				}
			});
			return models;
		};

		const selectedModels = findModelsByKeys(treeData, checkedKeys);

		if (selectedModels.length === 0) {
			message.warning('Выбранные элементы не содержат моделей для экспорта');
			return;
		}

		// Формируем данные для Excel
		const rows = selectedModels.map((m) => {
			// Начинаем с базового объекта
			const obj = {
				ID: m.id,
				Название: m.name,
				Описание: m.descr,
			};

			// Функция для удобного добавления свойства, если оно есть в checkedList
			const addIfChecked = (key, value) => {
				if (checkedList && checkedList.includes(key)) {
					obj[key] = value;
				}
			};

			// Добавляем свойства с проверкой
			addIfChecked(
				'Предпродажа',
				`${
					currentCurrency ? convertToRub(m.prices.price_0, m.currency) : m.prices.price_0
				} ${getCurrencySimbol(m.currency)}`
			);
			addIfChecked(
				'Проектная',
				`${
					currentCurrency ? convertToRub(m.prices.price_10, m.currency) : m.prices.price_10
				} ${getCurrencySimbol(m.currency)}`
			);
			addIfChecked(
				'Прайс 20',
				`${
					currentCurrency ? convertToRub(m.prices.price_20, m.currency) : m.prices.price_20
				} ${getCurrencySimbol(m.currency)}`
			);
			addIfChecked(
				'Прайс 30',
				`${
					currentCurrency ? convertToRub(m.prices.price_30, m.currency) : m.prices.price_30
				} ${getCurrencySimbol(m.currency)}`
			);

			return obj;
		});

		const ws = XLSX.utils.json_to_sheet(rows);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Прайс');
		XLSX.writeFile(
			wb,
			`${dayjs().format('DD.MM.YYYY')}. Прайс_лист. ${currentCurrency ? 'Рубли' : 'Валюта'}.xlsx`
		);
	};
	const onCheckAllChange = (e) => {
		setCheckedList(e.target.checked ? plainOptions : []);
	};

	if (loading) return <Spin tip="Загрузка прайс-листа..." />;

	return (
		<div style={{backgroundColor: 'aliceblue', width: '100%', height: 'calc(100vh - 50px)'}}>
			<div className={style.switch__currency}>
				<div>
					<Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
						Выбрать все
					</Checkbox>
					<CheckboxGroup options={plainOptions} value={checkedList} onChange={onChange} />
				</div>
				<div style={{ marginRight: '10px' }}>
					<Switch
						checkedChildren="Рубли"
						unCheckedChildren="Валюта"
						onChange={(_) => setCurrentCurrency((prev) => !prev)}
					/>
				</div>
				<div>
					<Button onClick={handleExport} type="primary" size={'small'}>
						Экспортировать выбранное в Excel
					</Button>
				</div>
			</div>
			<h1 style={{ marginTop: '50px' }}>Прайс-лист</h1>
			<div className={style.price__cont}>
				<Tree
					checkable
					selectable={false}
					treeData={treeData}
					checkedKeys={checkedKeys}
					onCheck={(keys) => setCheckedKeys(keys)}
					style={{
						backgroundColor: '#b4cbe4',
						// padding: '12px',
						// borderRadius: '6px',
						// border: '1px solid #d9d9d9'
					}}
				/>
			</div>
		</div>
	);
};

export default Price;
