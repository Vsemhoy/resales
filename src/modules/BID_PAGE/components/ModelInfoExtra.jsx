import React, {useEffect, useState} from 'react';
import {Drawer, Spin, Table} from "antd";
import {CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {EXTRA} from "../mock/mock";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";

const ModelInfoExtra = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [extraId, setExtraId] = useState(null);
    const [extraName, setExtraName] = useState('');
    const [extraInfo, setExtraInfo] = useState([]);
    const columns = [
        {
            title: "",
            dataIndex: "name",
            align: "left",
            render: (e) => <div style={{ fontSize: "12px" }}>{e}</div>,
        },
        {
            title: "",
            dataIndex: "value",
            align: "left",
            render: (e) => <div style={{ fontSize: "12px" }}>{e}</div>,
        },
    ];

    useEffect(() => {
        if (props.model_id) {
            setExtraId(props.model_id);
        }
    }, [props.model_id]);

    useEffect(() => {
        if (props.model_name) {
            setExtraName(props.model_name);
        }
    }, [props.model_name]);

    useEffect(() => {
        if (extraId) {
            setIsLoading(true);
            fetchModelInfoExtra().then(() => {
                setTimeout(() => setIsLoading(false), 500);
            });
        } else {
            props.closeDrawer();
        }
    }, [extraId]);

    const fetchModelInfoExtra = async () => {
        if (PRODMODE) {
            try {
                let response = await PROD_AXIOS_INSTANCE.get(`/sales/data/getmodelprops/?_token=${CSRF_TOKEN}&model_id=${extraId}`, {
                    _token: CSRF_TOKEN,
                });
                if (response.data.props) {
                    setExtraInfo(response.data.props);
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            setExtraInfo(EXTRA);
        }
    };

    return (
        <Drawer
            title={`Дополнительная информация`}
            placement="right"
            width={600}
            onClose={(_) => {
                setExtraId(null);
                setExtraName('');
                setExtraInfo([]);
            }}
            open={extraId}
        >
            <Spin spinning={isLoading}>
                <h2>{extraName}</h2>
                <div className={'extra__table__container'}>
                    <Table
                        columns={columns}
                        dataSource={extraInfo}
                        showHeader={false}
                        size={"small"}
                        pagination={false}
                        bordered={true}
                    />
                </div>
            </Spin>
        </Drawer>
    );
}

export default ModelInfoExtra;
