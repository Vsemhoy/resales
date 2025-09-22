import React, {useEffect, useState} from 'react';
import {Drawer, Table} from "antd";
import {DownloadOutlined} from "@ant-design/icons";
import {CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {PROD_API_URL, PROD_AXIOS_INSTANCE} from "../../../config/Api";
import dayjs from "dayjs";
import {FILES} from "../../BID_PAGE/mock/mock";

const EngineerFilesDrawer = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState(false);

    const columns = [
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
                <a onClick={() => fetchDownloadFile(v.file_link)}>
                    <DownloadOutlined style={{ fontSize: "16px", color: "#5099ff" }} />
                </a>
            ),
            align: "center",
        },
    ];

    useEffect(() => {
        if (props.bidId) {
            setIsLoading(true);
            fetchFiles().then(() => {
                setIsLoading(false);
            });
        }
    }, [props.bidId]);

    const fetchFiles = async () => {
        if (PRODMODE) {
            try {
                const response = await PROD_AXIOS_INSTANCE.post("/api/sales/engineer/orders/document/show/" + props.bidId, {
                    data: {},
                    _token: CSRF_TOKEN,
                });
                if (response.data) {
                    setFiles(
                        response.data.content.files.map((el) => {
                            return {
                                key: el.id,
                                date: get_date_by_unix(el.created_at),
                                name: parseNameFromFilePath(el.name_file),
                                file_link: el.name_file,
                                download: "download",
                                // template_id: el.template_id,
                                // type: el.type,
                            };
                        }),
                    );
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            setFiles(
                FILES.map((el) => {
                    return {
                        key: el.id,
                        date: get_date_by_unix(el.created_at),
                        name: parseNameFromFilePath(el.name_file),
                        file_link: el.name_file,
                        download: "download",
                    };
                }),
            );
        }
    };
    const fetchDownloadFile = async (file_link) => {
        console.log(file_link)
        if (PRODMODE) {
            try {
                // const parts = file_link.split('/');
                window.open(`${file_link}`, "_blank", "noopener,noreferrer",);
            } catch (e) {
                console.log(e);
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
            width={600}
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

export default EngineerFilesDrawer;
