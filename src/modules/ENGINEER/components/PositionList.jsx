import { useEffect, useRef, useState } from "react";
import { Button, Table, Tag } from "antd";

//import { exportToExcel } from "react-json-to-excel";
import style from "./style/main.module.css";

import {PROD_AXIOS_INSTANCE} from "../../../config/Api";
import {CSRF_TOKEN, PRODMODE} from "../../../config/config";

const PositionList = ({ bidId, type = 1 }) => {
    const [positions, setPositions] = useState(null);
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
                    type: type,
                },
            };
            const models_response = await PROD_AXIOS_INSTANCE.post(
                "/sales/data/getbidmodels",
                format_data,
            );
            models_response && setPositions(models_response.data.data.models);
            models_response && setComment(models_response.data.data.bid_comment);
        } catch (e) {
            console.log(e);
        } finally {
            setLoad(false);
        }
    };

    useEffect(() => {
        PRODMODE && get_models_req();
    }, [bidId]);

    const result = positions
        ? positions.map((el, index) => {
            return {
                id: index + 1,
                key: el.model_id,
                model_name: el.model_name,
                model_count: el.model_count,
            };
        })
        : [];
    const excel_data = result.map((el) => {
        return {
            "№": el.id,
            'ID': el.key,
            'Наименование': el.model_name,
            'Количество': el.model_count,
        };
    });
    const columns = [
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
    ];

    return (
        <div>
            <div className={style.add__header}>СПЕЦИФИКАЦИЯ</div>
            <div ref={ref1}>
                <Table
                    dataSource={result}
                    columns={columns}
                    pagination={false}
                    size={"small"}
                    loading={load}
                />
            </div>
            {/*<div className={style.add__btn}>*/}
            {/*    <Button*/}
            {/*        onClick={() => {*/}
            {/*            //exportToExcel(excel_data, bidId);*/}
            {/*        }}*/}
            {/*        size={"small"}*/}
            {/*    >*/}
            {/*        Экспорт в EXCEL*/}
            {/*    </Button>*/}
            {/*</div>*/}
        </div>
    );
};

export default PositionList;
