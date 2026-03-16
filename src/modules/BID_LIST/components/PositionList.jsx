import React, { useEffect, useState } from 'react';
import { Button, Tag } from 'antd';
import style from './style/main.module.css';

import { PROD_AXIOS_INSTANCE } from '../../../config/Api';
import {CSRF_TOKEN, PRODMODE, ROUTE_PREFIX} from '../../../config/config';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-community';
import {GET_BID_FILES, GET_BID_MODELS} from "../mock/mock";

import { Space } from 'antd';

const PositionList = ({ bidId, fetch_path, error_alert }) => {
	const [tableHeader, setTableHeader] = useState('');
	const [positions, setPositions] = useState(null);
	const [files, setFiles] = useState(null);
	const [load, setLoad] = useState(true);

	useEffect(() => {
		fetchModelsReq().then();
	}, [bidId]);

    const sortedBidModels = React.useMemo(() => {
        if (!positions || positions.length === 0) return [];
        return [...positions].sort((a, b) => +a.sort - +b.sort);
    }, [positions]);

	const fetchModelsReq = async () => {
		if (PRODMODE) {
			const path = fetch_path;
			try {
				setLoad(true);
				const format_data = {
					_token: CSRF_TOKEN,
					data: {
						bid_id: bidId,
					},
				};
				const models_response = await PROD_AXIOS_INSTANCE.post(path, format_data);
				if (models_response && models_response.data.data.models) {
					setPositions(models_response.data.data.models);
					setTableHeader('СПЕЦИФИКАЦИЯ');
				} else if (models_response && models_response.data.data.files) {
					setFiles(models_response.data.data.files);
					setTableHeader('ФАЙЛЫ');
				} else if (models_response && models_response.data.content.files) {
					setFiles(models_response.data.content.files);
					setTableHeader('ФАЙЛЫ');
				}
				setLoad(false);
			} catch (e) {
				console.log(e);
				error_alert(path, e);
				setLoad(false);
			}
		} else {
            if (fetch_path) {
                setLoad(true);
                //setPositions(GET_BID_MODELS.models);
                //setTableHeader('СПЕЦИФИКАЦИЯ');
                setFiles(GET_BID_FILES.files);
                setTableHeader('ФАЙЛЫ');
                setLoad(false);
            }
        }
	};
    const handleDownload = async (file) => {
        console.log(file);
        let data = {};
        if (file.type === 1) {
            data = {
                template_id: file.template_id,
                id: file.id,
                bid_id: bidId,
                type: file.type,
                new: false,
            };
        } else {
            data = {
                template_id: file.template_id,
                id: file.id,
                bid_id: bidId,
                type: file.type,
                new: false,
            };
        }
        if (PRODMODE) {
            const path = `${ROUTE_PREFIX}/sales/makedoc`;
            try {
                const format_data = {
                    _token: CSRF_TOKEN,
                    data,
                };
                const file_response = await PROD_AXIOS_INSTANCE.post(path, format_data);
                const parts = file_response.data.data.file_link.split('/');
                const withSlash = '/' + parts.slice(1).join('/');
                window.open(`${withSlash}`, '_blank', 'noopener,noreferrer');
            } catch (e) {
                console.log(e);
                error_alert(path, e);
            }
        }
    };
	const handleExport = () => {
		console.log(positions);
		const rows = positions.map((m) => {
			// Начинаем с базового объекта
			const obj = {
				ID: m.model_id,
				Название: m.model_name,
				Количество: m.model_count,
				Процент: m.percent,
				Цена: m.price,
			};
			return obj;
		});
		const ws = XLSX.utils.json_to_sheet(rows);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Спецификация');
		XLSX.writeFile(wb, `${dayjs().format('DD.MM.YYYY')}. ${bidId}-Спецификация.xlsx`);
	};

	return (
		<div>
			<div className={style.add__header}>{tableHeader}</div>
			<div className={style.tags__container}>
				{load && <div>Загрузка...</div>}
				{!load && sortedBidModels && sortedBidModels.map((item, idx) => (
                    <div key={`pos-${bidId}-${item.id || item.model_id || idx}`}>
                        <Space.Compact block>
                            <Button size={'small'} color={'default'} variant={'filled'}>{item.model_name}</Button>
                            <Button size={'small'} color={'primary'} variant={'filled'}>{item.model_count}</Button>
                        </Space.Compact>
                    </div>
				))}
				{!load && !sortedBidModels && files && files.map((item, idx) => (
                    <div key={`file-${bidId}-${item.id || idx}`} onClick={() => handleDownload(item)}>
                        <Space.Compact block>
                            <Button size={'small'} color={'primary'} variant={'filled'}>{item.name_file.split('.')[item.name_file.split('.').length - 1]}</Button>
                            <Button size={'small'} color={'default'} variant={'filled'}>{`${dayjs(item.created_at * 1000).format('DD.MM.YYYY HH:mm')}`}</Button>
                        </Space.Compact>
                    </div>
				))}
			</div>
			{sortedBidModels && (
				<div className={style.add__btn}>
					<Button onClick={() => handleExport()} size={'small'}>
						Экспорт в EXCEL
					</Button>
				</div>
			)}
		</div>
	);
};

export default PositionList;
