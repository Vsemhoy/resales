import React, {useEffect, useState} from 'react';
import {Drawer, Table} from "antd";
import {DownloadOutlined} from "@ant-design/icons";
import {CSRF_TOKEN, HTTP_HOST, PRODMODE} from "../../../config/config";
import {PROD_API_URL, PROD_AXIOS_INSTANCE} from "../../../config/Api";
import dayjs from "dayjs";
import {FILES} from "../../BID_PAGE/mock/mock";

const BidFilesDrawer = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState(false);
    const [columns, setColumns] = useState([]);

    const columnsKP = [
        {
            title: "Дата",
            dataIndex: "date",
            key: "date",
            render: (e) => <span style={{ fontSize: "12px" }}>{e}</span>,
        },
        {
            title: "Имя файла",
            dataIndex: "name",
            key: "name",
            render: (e) => <span style={{ fontSize: "12px" }}>{e}</span>,
        },
        {
            title: "",
            dataIndex: "download",
            key: "download",
            width: 30,
            render: (e, v) => (
                <a onClick={() => fetchDownloadFile(v.template_id, v.key, v.type)}>
                    <DownloadOutlined className={'download-outlined'} />
                </a>
            ),
            align: "center",
        },
    ];

    const columnsBill = [
        {
            title: "Дата создания",
            dataIndex: "date",
            key: "date",
            render: (e) => <span style={{ fontSize: "12px" }}>{e}</span>,
        },
        {
            title: "Дата оплаты",
            dataIndex: "date_pay",
            key: "date_pay",
            render: (e) => <span style={{ fontSize: "12px" }}>{e}</span>,
        },
        {
            title: "Номер счета",
            dataIndex: "number_invoice",
            key: "number_invoice",
            render: (e) => <span style={{ fontSize: "12px" }}>{e}</span>,
        },
        {
            title: "Номер заказа 1С",
            dataIndex: "number_bid",
            key: "number_bid",
            render: (e) => <span style={{ fontSize: "12px" }}>{e}</span>,
        },
        {
            title: "Скачать",
            dataIndex: "bo_file_invoice",
            key: "bo_file_invoice",
            width: 30,
            render: (e, v) => (
                <a href={`${HTTP_HOST}/${e}`}>
                    <DownloadOutlined className={'download-outlined'}/>
                </a>
            ),
            align: "center",
        },
        {
            title: "zend2",
            dataIndex: "file_invoice",
            key: "file_invoice",
            width: 30,
            render: (e, v) => (
                <a href={`http://zend2.arstel.su/kpischet/api/downloadinvoice?id=${v.key}`}>
                    <DownloadOutlined className={'download-outlined'}/>
                </a>
            ),
            align: "center",
        },
    ];

    useEffect(() => {
        if (+props.bidType === 1) {
            setColumns(columnsKP);
        } else if (+props.bidType === 2) {
            setColumns(columnsBill);
        }
    }, [props.bidType]);

    useEffect(() => {
        if (props.bidId && props.isOpenDrawer) {
            setIsLoading(true);
            fetchFiles().then(() => {
                setIsLoading(false);
            });
        }
    }, [props.bidId, props.isOpenDrawer]);

    const fetchFiles = async () => {
        if (PRODMODE) {
            const path = `/api/sales/doclist`;
            try {
                const response = await PROD_AXIOS_INSTANCE.post(path, {
                    data: {
                        bid_id: props.bidId,
                    },
                    _token: CSRF_TOKEN,
                });
                if (response.data) {
                    setFiles(
                        response.data.data.files.map((el) => {
                            return {
                                key: el?.id,
                                date: get_date_by_unix(el?.created_at),
                                name: parseNameFromFilePath(el?.name_file),
                                download: "download",
                                template_id: el?.template_id,
                                type: el?.type,

                                date_pay: el?.date_pay,
                                number_invoice: el?.number_invoice,
                                number_bid: el?.number_bid,
                                bo_file_invoice: el?.bo_file_invoice,
                                file_invoice: el?.file_invoice,
                            };
                        }),
                    );
                }
            } catch (e) {
                console.log(e);
                props.error_alert(path, e);
            }
        } else {
            setFiles(
                FILES.map((el) => {
                    return {
                        key: el.id,
                        date: get_date_by_unix(el.created_at),
                        name: parseNameFromFilePath(el.name_file),
                        download: "download",
                        template_id: el.template_id,
                        type: el.type,
                    };
                }),
            );
        }
    };
    const fetchDownloadFile = async (template_id, id, type) => {
        if (PRODMODE) {
            const path = `/api/sales/makedoc`;
            try {
                const data = {
                    data: {
                        template_id,
                        id,
                        bid_id: props.bidId,
                        type,
                        new: false,
                    },
                    _token: CSRF_TOKEN,
                };
                const config = { timeout: 50000 };
                const response = await PROD_AXIOS_INSTANCE.post(path, data, config,);
                const parts = response.data.data.file_link.split('/');
                const withSlash = '/' + parts.slice(1).join('/');
                window.open(`${withSlash}`, "_blank", "noopener,noreferrer",);
            } catch (e) {
                console.log(e);
                props.error_alert(path, e);
            }
        }
    };

    const get_date_by_unix = (unix) => {
        return unix < 1000000000
            ? ""
            : unix < 1000000000000
                ? dayjs(+unix * 1000).format("DD.MM.YY HH:mm")
                : dayjs(+unix).format("DD.MM.YY HH:mm");
    };
    const parseNameFromFilePath = (path) => {
        if (path) {
            const pathArr = path.split("/");
            return pathArr.length > 0 ? pathArr[pathArr.length - 1] : "";
        }

        return "";
    };

    return (
        <Drawer
            title={`Файлы`}
            placement="right"
            width={props.bidType === 2 ? 1000 : 600}
            onClose={() => props.closeDrawer()}
            open={props.isOpenDrawer}
        >
            <Table
                size={"small"}
                pagination={false}
                loading={isLoading}
                dataSource={files}
                columns={columns}
                bordered={true}
            />
        </Drawer>
    );
};

export default BidFilesDrawer;

