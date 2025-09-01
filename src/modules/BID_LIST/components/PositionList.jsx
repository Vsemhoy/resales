import { useEffect, useRef, useState } from "react";
import { Button, Table, Tag } from "antd";

//import { exportToExcel } from "react-json-to-excel";
import style from "./style/main.module.css";

import {PROD_API_URL, PROD_AXIOS_INSTANCE} from "../../../config/Api";
import {CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {DownloadOutlined} from "@ant-design/icons";
import dayjs from "dayjs";

const PositionList = ({ bidId, path }) => {
    const [tableHeader, setTableHeader] = useState('');
    const [tableColumns, setTableColumns] = useState([]);
    const [positions, setPositions] = useState(null);
    const [files, setFiles] = useState(null);
    const [comment, setComment] = useState(null);
    const [load, setLoad] = useState(true);
    const ref1 = useRef(null);

    const get_models_req = async () => {
        try {
            setLoad(true);
            const format_data = {
                _token: CSRF_TOKEN,
                data: {
                    bid_id: bidId,
                },
            };
            const models_response = await PROD_AXIOS_INSTANCE.post(
                path,
                format_data,
            );
            if (models_response && models_response.data.data.models) {
                setPositions(models_response.data.data.models);
                setComment(models_response.data.data.bid_comment);
                setTableHeader('СПЕЦИФИКАЦИЯ');
                setTableColumns([
                    {
                        title: "",
                        dataIndex: "id",
                        key: "id",
                    },
                    {
                        title: "Наименование",
                        dataIndex: "model_name",
                        key: "model_name",
                    },
                    {
                        title: "Количество",
                        dataIndex: "model_count",
                        key: "model_count",
                    },
                ]);
            } else if (models_response && models_response.data.data.files) {
                setFiles(models_response.data.data.files);
                setTableHeader('ФАЙЛЫ');
                setTableColumns([
                    {
                        title: "Наименование",
                        dataIndex: "name_file",
                        key: "name_file",
                    },
                    {
                        title: "Дата",
                        dataIndex: "created_at",
                        key: "created_at",
                        render: (created_at) => {
                            if (!created_at) return '-';
                            return dayjs(created_at * 1000).format('DD.MM.YYYY HH:mm:ss');
                        }
                    },
                    {
                        title: "Скачать",
                        key: "download",
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
        } catch (e) {
            console.log(e);
        } finally {
            setLoad(false);
        }
    };

    const handleDownload = async (file) => {
        console.log(file)
        let data = {};
        if (file.type === 1) {
            data = {
                template_id: 1,
                id: file.id,
                bid_id: bidId,
                type: 1,
                new: false
            };
        } else {
            data = {
                "template_id": "path_usd",
                "id": file.id,
                "bid_id": bidId,
                "type": "oldFile",
                "new": false
            };
        }
        if (PRODMODE) {
            try {
                const format_data = {
                    _token: CSRF_TOKEN,
                    data,
                };
                const file_response = await PROD_AXIOS_INSTANCE.post(
                    "/api/sales/makedoc",
                    format_data,
                );
                const parts = file_response.data.data.file_link.split('/');
                const withSlash = '/' + parts.slice(1).join('/');
                window.open(
                    `${withSlash}`,
                    "_blank",
                    "noopener,noreferrer",
                );
            } catch (e) {
                console.log(e);
            }
        }
    };

    useEffect(() => {
        PRODMODE && get_models_req();
    }, [bidId]);

/*    const result = positions
        ? positions.map((el, index) => {
            return {
                id: index + 1,
                key: el.model_id,
                model_name: el.model_name,
                model_count: el.model_count,
            };
        })
        : [];*/
/*    const excel_data = result.map((el) => {
        return {
            "№": el.id,
            'ID': el.key,
            'Наименование': el.model_name,
            'Количество': el.model_count,
        };
    });*/
/*    const columns = [
        {
            title: "",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Наименование",
            dataIndex: "model_name",
            key: "model_name",
        },
        {
            title: "Количество",
            dataIndex: "model_count",
            key: "model_count",
        },
    ];*/

    return (
        <div>
            <div className={style.add__header}>{tableHeader}</div>
            <div ref={ref1}>
                <Table
                    dataSource={positions ? positions : files}
                    columns={tableColumns}
                    pagination={false}
                    size={"small"}
                    loading={load}
                />
            </div>
            {positions && (
                <div className={style.add__btn}>
                    <Button
                        onClick={() => {
                            //exportToExcel(excel_data, bidId);
                        }}
                        size={"small"}
                    >
                        Экспорт в EXCEL
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PositionList;
