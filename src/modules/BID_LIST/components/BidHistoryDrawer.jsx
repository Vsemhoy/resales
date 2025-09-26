import React, {useEffect, useState} from 'react';
import {Drawer, Table, Tabs, Tag, Timeline, Tooltip} from "antd";
import {CheckCircleOutlined, EyeOutlined, RedoOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";
import {ACTION_OPTIONS, LOGS} from "../../BID_PAGE/mock/mock";

const BidHistoryDrawer = (props) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [logs, setLogs] = useState([]);
    const [bidId, setBidId] = useState(null);
    const [actionOptions, setActionOptions] = useState(null);
    const [bidActions, setBidActions] = useState({
        'create': null,
        'update': null,
        'view': null,
    });

    const table_columns = [
        {
            title: "Дата",
            dataIndex: "date",
            align: "left",
            width: 120,
            render: (e) => (
                <div style={{ fontSize: "10px" }}>
                    {dayjs(e * 1000).format("DD.MM.YYYY HH:mm:ss")}
                </div>
            ),
        },
        {
            title: "Событие",
            dataIndex: "actname",
            align: "left",
            width: 120,
        },
        {
            title: "Инициатор",
            dataIndex: "username",
            align: "left",
            width: 150,
            render: (e) => <div style={{ fontSize: "10px" }}>{e}</div>,
        },
        {
            title: "Отдел",
            dataIndex: "placename",
            align: "center",
            render: (e, b) => (
                <div style={{ padding: "2px" }}>
                    <Tag color={b.placecolor} style={{ fontSize: "10px" }}>
                        {e}
                    </Tag>
                </div>
            ),
        },
    ];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (props.bidId) {
            setBidId(props.bidId);
        }
    }, [props.bidId]);

    useEffect(() => {
        if (props.bidActions) {
            setBidActions(props.bidActions);
        }
    }, [props.bidActions]);

    useEffect(() => {
        if (bidId && isMounted && props.isOpenDrawer) {
            fetchActionOptions().then();
        }
    }, [bidId, props.isOpenDrawer]);

    useEffect(() => {
        if (page && bidId && isMounted && props.isOpenDrawer) {
            fetchLogs().then();
        }
    }, [page, bidId, props.isOpenDrawer]);

    const fetchActionOptions = async () => {
        if (PRODMODE) {
            const path = `/api/sales/bidselects`;
            try {
                const format_data = {
                    _token: CSRF_TOKEN,
                    data: {
                        action_enum: 1,
                    },
                };
                const selects_response = await PROD_AXIOS_INSTANCE.post(path, format_data);
                if (selects_response) {
                    setActionOptions(selects_response.data.selects.action_enum);
                }
            } catch (e) {
                console.log(e);
                props.error_alert?.(path, e);
            }
        } else {
            setActionOptions(ACTION_OPTIONS);
        }
    };

    const fetchLogs = async () => {
        if (PRODMODE) {
            const path = `api/sales/bidlog/${bidId}?_token=${CSRF_TOKEN}&action_type=${page}`;
            try {
                setIsLoading(true);
                let response = await PROD_AXIOS_INSTANCE.get(path);
                if (response) {
                    setLogs(response.data.logs);
                }
                setIsLoading(false);
            } catch (e) {
                console.log(e);
                props.error_alert?.(path, e);
                setLogs([]);
                setIsLoading(false);
            }
        } else {
            setIsLoading(true);
            setLogs(LOGS);
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    const generateTabs = () => {
        if (!actionOptions) return [];

        return actionOptions.map((option) => ({
            key: option.value.toString(),
            label: (
                <Tooltip title={option.label}>
                    <span>{option.label}</span>
                </Tooltip>
            ),
            children: (
                <Table
                    columns={table_columns}
                    dataSource={parseInt(option.value) === page ? logs : []}
                    size={"small"}
                    pagination={false}
                    bordered={true}
                    scroll={{y: 500}}
                    loading={isLoading && parseInt(option.value) === page}
                />
            ),
        }));
    };

    const timelineItems = [
        {
            children: (
                <div className={'sa-timeline__container'}>
                    <div className={'sa-timeline__subtitle'}>Заявка создана</div>
                    <div className={'sa-timeline__title'}>
                        {bidActions.create?.date ?
                            dayjs(bidActions.create?.date * 1000).format("DD.MM.YYYY HH:mm:ss") :
                            '-'
                        }
                    </div>
                    <div className={'sa-timeline__text'}>{bidActions.create?.username}</div>
                </div>
            ),
            color: "green",
            dot: <CheckCircleOutlined style={{fontSize: "16px"}}/>,
        },
        {
            children: (
                <div className={'sa-timeline__container'}>
                    <div className={'sa-timeline__subtitle'}>Заявка обновлена</div>
                    <div className={'sa-timeline__title'}>
                        {bidActions.update?.date ?
                            dayjs(bidActions.update?.date * 1000).format("DD.MM.YYYY HH:mm:ss") :
                            '-'
                        }
                    </div>
                    <div className={'sa-timeline__text'}>{bidActions.update?.username}</div>
                </div>
            ),
            color: "blue",
            dot: <RedoOutlined style={{fontSize: "16px"}}/>,
        },
        {
            children: (
                <div className={'sa-timeline__container'}>
                    <div className={'sa-timeline__subtitle'}>Последний просмотр</div>
                    <div className={'sa-timeline__title'}>
                        {bidActions.view?.date ?
                            dayjs(bidActions.view?.date * 1000).format("DD.MM.YYYY HH:mm:ss") :
                            '-'
                        }
                    </div>
                    <div className={'sa-timeline__text'}>{bidActions.view?.username}</div>
                </div>
            ),
            color: "purple",
            dot: <EyeOutlined style={{fontSize: "16px"}}/>,
        },
    ];

    return (
        <Drawer
            title={`История действий`}
            placement="right"
            width={600}
            onClose={() => props.closeDrawer?.()}
            open={props.isOpenDrawer}
        >
            <div style={{userSelect: "none"}}>
                <Timeline
                    mode="left"
                    items={timelineItems}
                />
                <div>
                    <Tabs
                        size={"small"}
                        type="card"
                        activeKey={page.toString()}
                        items={generateTabs()}
                        onTabClick={(key) => setPage(parseInt(key))}
                    />
                </div>
            </div>
        </Drawer>
    );
};

export default BidHistoryDrawer;
