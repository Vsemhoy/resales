import { useEffect, useRef, useState } from 'react';
import { Button, Table } from 'antd';
import style from './style/main.module.css';

import { PROD_AXIOS_INSTANCE } from '../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../config/config';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-community';
import {FILES} from "../mock/mock";

const PositionList2 = ({ bidId, fetch_path, error_alert }) => {
    const [tableHeader, setTableHeader] = useState('');
    const [tableColumns, setTableColumns] = useState([]);
    const [positions, setPositions] = useState(null);
    const [files, setFiles] = useState(null);
    const [comment, setComment] = useState(null);
    const [load, setLoad] = useState(true);
    const ref1 = useRef(null);

    useEffect(() => {
        fetchModelsReq().then();
    }, [bidId]);

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
                if (models_response && models_response.data.content.files) {
                    console.log(models_response.data.content.files);
                    setFiles(models_response.data.content.files);
                    setTableHeader('ФАЙЛЫ');
                    setTableColumns([
                        {
                            title: 'Наименование',
                            dataIndex: 'name_file',
                            key: 'name_file',
                        },
                        {
                            title: 'Дата',
                            dataIndex: 'created_at',
                            key: 'created_at',
                            render: (created_at) => {
                                if (!created_at) return '-';
                                return dayjs(created_at * 1000).format('DD.MM.YYYY HH:mm:ss');
                            },
                        },
                        {
                            title: 'Скачать',
                            key: 'download',
                            render: (_, record) => (
                                <Button
                                    type="link"
                                    icon={<DownloadOutlined />}
                                    onClick={() => handleDownload(record)}
                                    size="small"
                                ></Button>
                            ),
                        },
                    ]);
                }
                setLoad(false);
            } catch (e) {
                console.log(e);
                error_alert(path, e);
                setLoad(false);
            }
        } else {
            setFiles(FILES);
            setTableHeader('ФАЙЛЫ');
            setTableColumns([
                {
                    title: 'Наименование',
                    dataIndex: 'name_file',
                    key: 'name_file',
                },
                {
                    title: 'Дата',
                    dataIndex: 'created_at',
                    key: 'created_at',
                    render: (created_at) => {
                        if (!created_at) return '-';
                        return dayjs(created_at * 1000).format('DD.MM.YYYY HH:mm:ss');
                    },
                },
                {
                    title: 'Скачать',
                    key: 'download',
                    render: (_, record) => (
                        <Button
                            type="link"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(record)}
                            size="small"
                        ></Button>
                    ),
                },
            ]);

            setLoad(false);

        }
    };

    const handleDownload = async (file) => {
        if (PRODMODE) {
            try {
                // const parts = file_link.split('/');
                window.open(`${file.name_file}`, "_blank", "noopener,noreferrer",);
            } catch (e) {
                console.log(e);
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
            <div ref={ref1}>
                <Table
                    dataSource={positions ? positions : files}
                    columns={tableColumns}
                    pagination={false}
                    size={'small'}
                    loading={load}
                />
            </div>
            {positions && (
                <div className={style.add__btn}>
                    <Button onClick={() => handleExport()} size={'small'}>
                        Экспорт в EXCEL
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PositionList2;
