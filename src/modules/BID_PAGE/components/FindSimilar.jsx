import React, {useEffect, useState} from 'react';
import ru from "antd/es/date-picker/locale/ru_RU";
import ruRU from "antd/es/locale/ru_RU";
import {Button, Checkbox, DatePicker, Drawer, Input, InputNumber, Segmented, Select, Table, Tag, Tooltip} from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
import {CSRF_TOKEN, PRODMODE} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";
import {SIMILAR_BIDS} from "../mock/mock";
import dayjs from "dayjs";

const buddhistLocale = {
    ...ru,
    lang: {
        ...ru.lang,
    },
};
export const globalBuddhistLocale = {
    ...ruRU,
    DatePicker: {
        ...ruRU.DatePicker,
        lang: buddhistLocale.lang,
    },
};

const FindSimilar = (props) => {

    const { RangePicker } = DatePicker;

    const [similarData, setSimilarData] = useState([]);
    const [type, setType] = useState(0);
    const [mondatoryAll, setMondatoryAll] = useState(false); //  Только 100% совпадение со спецификацией
    //const [proptect, setProtect] = useState(false); //  OLD Учитывать статус защиты проекта
    const [proptect, setProtect] = useState(0); //  Учитывать статус защиты проекта
    const [notSelf, setNotSelf] = useState(false); //  Не искать в своих заявках
    const [searchType, setSearchType] = useState(1); //  Тип поиска подстроки
    const [dates, setDates] = useState([0, 0]); //  Интервал дат
    const [text, setText] = useState(""); //  Поисковая строка
    const [limit, setLimit] = useState(10); //  Количество заявок в результатах
    const [similar, setSimilar] = useState([]); //  Результаты поиска
    const [lastId, setLastId] = useState(0); //  Результаты поиска
    const [range, setRange] = useState(0); //  Результаты поиска
    const [notMatchLimit, setNotMatchLimit] = useState(0); //  Результаты поиска
    /*    const [debouncedInputValue, setDebouncedInputValue] = useState("")              //*/
    const [load, setLoad] = useState(false);
    const [searchCountTitle, setSearchCountTitle] = useState(`Найдено: 0`);
    const [notCompany, setNotCompany] = useState(0);
    const [childrenDrawer, setChildrenDrawer] = useState(false);
    const settingsColumns = [
        {
            title: "Настройки поиска",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "",
            dataIndex: "value",
            key: "value",
            align: "right",
            width: 250,
        },
    ];
    const searchStringTypeOptions = [
        {
            label: "везде",
            value: 1,
            key: 91,
        },
        {
            label: "в названии компании",
            value: 2,
            key: 92,
        },
        {
            label: "в названии объекта",
            value: 3,
            key: 93,
        },
        {
            label: "в комментариях",
            value: 4,
            key: 94,
        },
    ];
    const DS_SIMILAR_COLUMNS = [
        {
            title: searchCountTitle,
            dataIndex: "data",
            key: "data",
            width: 500,
        },
        /*{
            title: "",
            dataIndex: "value",
            key: "value",
        },*/
    ];
    const limitsMarks = [
        {
            label: "10",
            value: 10,
            key: 81,
        },
        {
            label: "50",
            value: 50,
            key: 82,
        },
        {
            label: "100",
            value: 100,
            key: 83,
        },
        {
            label: "200",
            value: 200,
            key: 84,
        },
        {
            label: "500",
            value: 500,
            key: 85,
        },
        {
            label: "без лимита",
            value: 0,
            key: 86,
        },
    ];
    const documentProtectOptions = [
        {
            label: "ЗП и РП",
            value: 0,
            key: 111,
        },
        {
            label: "ЗП",
            value: 1,
            key: 222,
        },
        {
            label: "РП",
            value: 2,
            key: 333,
        },
        {
            label: "Нет",
            value: 3,
            key: 444,
        },
    ];
    const documentTypeOptions = [
        {
            label: "КП и СЧЕТ",
            value: 0,
            key: 31,
        },
        {
            label: "КП",
            value: 1,
            key: 32,
        },
        {
            label: "СЧЕТ",
            value: 2,
            key: 33,
        },
    ];
    const defaultSimilarAddData = [
        {
            name: "Только 100% совпадение со спецификацией",
            key: 1,
            value: (
                <Checkbox
                    checked={mondatoryAll}
                    onChange={(v) => setMondatoryAll(v.target.checked)}
                />
            ),
        },
        {
            name: "Учитывать статус защиты проекта",
            key: 2,
            value: (
                /*<Checkbox                         // OLD
                    checked={proptect}
                    onChange={(v) => setProtect(v.target.checked)}
                />*/
                <Select
                    style={{ width: "160px", textAlign: "left" }}
                    size={"small"}
                    options={documentProtectOptions}
                    value={proptect}
                    onSelect={(v) => setProtect(v)}
                />
            ),
        },
        /*{
            name: "Не искать среди заявок данной компании",
            key: 3,
            value: (
                <Checkbox
                    checked={notCompany}
                    onChange={(v) => setNotCompany(v.target.checked)}
                />
            ),
        },
        {
            name: "Не искать в своих заявках",
            key: 9,
            value: (
                <Checkbox
                    checked={notSelf}
                    onChange={(v) => setNotSelf(v.target.checked)}
                />
            ),
        },*/
        {
            name: "Искать:",
            key: 4,
            value: (
                <Select
                    style={{ width: "160px", textAlign: "left" }}
                    size={"small"}
                    options={documentTypeOptions}
                    value={type}
                    onSelect={(v) => setType(v)}
                />
            ),
        },
        {
            name: "Вывести совпадений:",
            key: 5,
            value: (
                <Select
                    style={{ width: "160px", textAlign: "left" }}
                    size={"small"}
                    options={limitsMarks}
                    value={limit}
                    onSelect={(v) => setLimit(v)}
                />
            ),
        },
        {
            name: (
                <div>
                    {"Количественное отклонение: "}
                    <Tooltip
                        title={
                            "Допустимое отклонение количества позиций оборудования в искомой спецификации от количества позиций оборудования в текущей."
                        }
                    >
                        <QuestionCircleOutlined />
                    </Tooltip>
                </div>
            ),
            key: 7,
            value: (
                <InputNumber
                    min={0}
                    size={"small"}
                    max={10}
                    value={range}
                    onChange={setRange}
                    changeOnWheel
                    style={{ width: "160px" }}
                />
            ),
        },
        {
            name: (
                <div>
                    {"Допустимые несовпадения: "}
                    <Tooltip
                        title={
                            "Допустимое количество позиций оборудования в искомой спецификации, отсутствующего в текущей."
                        }
                    >
                        <QuestionCircleOutlined />
                    </Tooltip>
                </div>
            ),
            key: 8,
            value: (
                <InputNumber
                    min={0}
                    size={"small"}
                    max={10}
                    value={notMatchLimit}
                    onChange={setNotMatchLimit}
                    changeOnWheel
                    style={{ width: "160px" }}
                />
            ),
        },
        /*{
            name: "Заявка создана в интервале:",
            key: 6,
            value: (
                <ConfigProvider
                    locale={globalBuddhistLocale}
                    theme={{ components: { DatePicker: { borderRadius: 4 } } }}
                >
                    <RangePicker
                        format={"DD.MM.YYYY"}
                        size={"small"}
                        onChange={(_) => {
                            setDates(
                                _
                                    ? [
                                        +_[0].startOf("day").format("x"),
                                        +_[1].endOf("day").format("x"),
                                    ]
                                    : [null, null],
                            );
                        }}
                    />{" "}
                </ConfigProvider>
            ),
        },*/
    ];

    useEffect(() => {
        const searchModels = props?.bid_models
            ? props.bid_models.map((el, index) => {
                return {
                    model_id: el.model_id,
                    count: el.model_count,
                    mandatory_by_model: false,
                    mandatory_by_count: false,
                    key: index,
                    name: el.model_name,
                };
            })
            : [];
        setSimilarData(searchModels);
    }, [props.bid_models]);
    useEffect(() => {
        const similar_data = async () => {
            /*const getType = (text) => {
                switch (text) {
                    case "КП и СЧЕТ":
                        return 0;
                    case "КП":
                        return 1;
                    case "СЧЕТ":
                        return 2;
                    default:
                        return 0;
                }
            };*/
            const fetchSearchType = (text) => {
                switch (text) {
                    case "ВЕЗДЕ":
                        return 1;
                    case "В НАЗВАНИИ КОМПАНИИ":
                        return 2;
                    case "В НАЗВАНИИ ОБЪЕКТА":
                        return 3;
                    case "В КОММЕНТАРИЯХ":
                        return 4;
                    default:
                        return 0;
                }
            };
            if (PRODMODE) {
                const path = `/sales/data/getsimilarbid`
                try {
                    setLoad(true);
                    let response = await PROD_AXIOS_INSTANCE.post(path, {
                            bid_id: props?.bid_id,
                            _token: CSRF_TOKEN,
                            data: {
                                type: type,
                                protection_project: proptect
                                    ? props?.protection_project
                                    : 0,
                                bid_models: similarData,
                                mondatoryAll,
                                notMe: notSelf,
                                searchType: searchType,
                                dates,
                                searchText: text,
                                limit,
                                range,
                                notMatchLimit,
                                notCompany,
                            },
                        },
                    );
                    if (response.data) {
                        setLoad(false);
                        setSimilar(response.data.content.result.bids);
                        setSearchCountTitle(`Найдено: ${response.data.content.result.count_all}`);
                    }
                } catch (e) {
                    console.log(e);
                    props?.error_alert(path, e);
                }
            } else {
                setSimilar(SIMILAR_BIDS.bids);
                setSearchCountTitle(`Найдено: ${SIMILAR_BIDS.count_all}`);
            }
        };
        const delayInputTimeoutId = setTimeout(() => {
            similar_data().then();
        }, 1000);
        return () => clearTimeout(delayInputTimeoutId);
    }, [
        dates,
        type,
        mondatoryAll,
        proptect,
        notSelf,
        searchType,
        similarData,
        text,
        limit,
        range,
        notMatchLimit,
        notCompany,
    ]);

    const change = (value, id, type) => {
        const newData = similarData.slice();
        if (type === "model") {
            newData.find((el) => {
                if (el.model_id === id) {
                    el.mandatory_by_model = value.target.checked;
                }
            });
        } else if (type === "count") {
            newData.find((el) => {
                if (el.model_id === id) {
                    el.mandatory_by_count = value.target.checked;
                }
            });
        }
        setSimilarData(newData);
    };
    const onChildrenDrawerClose = () => {
        setChildrenDrawer(false);
    };
    const modelsColumns = (change) => {
        return [
            {
                title: "Наименование",
                dataIndex: "name",
                key: "name",
            },
            {
                title: "Количество",
                dataIndex: "count",
                key: "count",
            },
            {
                title: "Точное соответствие наименования",
                dataIndex: "mandatory_by_model",
                key: "mandatory_by_model",
                render: (text, elem) => (
                    <Checkbox
                        checked={elem.mandatory_by_model}
                        onChange={(v) => change(v, elem.model_id, "model")}
                    />
                ),
                align: "center",
            },
            /*{
                title: "Точное соответствие количества",
                dataIndex: "mcount",
                key: "mcount",
                render: (text, elem) => (
                    <Checkbox
                        checked={elem.mandatory_by_count}
                        onChange={(v) => change(v, elem.model_id, "count")}
                    />
                ),
                align: "center",
            },*/
        ];
    };
    const D = ({ bid, models }) => {
        return (
            <div className={'sa-similar__card__subcont__item'}>
                <div className={'sa-similar__text__title'}>
                    {bid.org_name}
                    <a
                        style={{ fontSize: "12px", marginLeft: "10px" }}
                        href={`/resales/bids/${bid.id}`}
                    >
                        {"  ID " + bid.id}
                    </a>{" "}
                    <Tag>{+bid.type === 1 ? 'КП' : +bid.type === 2 ? 'Счет' : ''}</Tag>
                </div>
                <div>
                    <b>Защита проекта: </b>
                    {+bid.protection_project === 1 ? 'ЗП' :
                    +bid.protection_project === 2 ? 'РП'
                        : 'Нет'}
                </div>
                <Tooltip title={bid.object}>
                    <div>
                        <b>Объект: </b>
                        {bid.object}
                    </div>
                </Tooltip>
                <div>
                    <b>Город: </b>
                    {bid.towns}
                </div>
                <div>
                    <b>Заявка от: </b>
                    {bid.user}
                </div>
                <div>
                    <b>Дата: </b>
                    {`${dayjs(bid.date * 1000).format("DD.MM.YYYY")}`}
                </div>
                <div>
                    <b>Модели: </b>
                    <S models={models}/>
                </div>
            </div>
        );
    };
    const S = ({ models }) => {
        console.log(models)
        const modelsPrepared = models
            ? models
                /*.sort(function (a, b) {
                    return b.model_match - a.model_match;
                })*/
                .map((el, idx) => {
                    return (
                        <div key={Math.random()} className={'model-with-tag'}>
                            {el.an_models_name}
                            <Tag className={'sa-similar__tag'}
                                 color={el.coincidence ? 'success' : 'error'}
                            >
                                {el.model_count}
                            </Tag>,
                        </div>
                    );
                })
            : [];
        return <div className={'sa-similar__card__models__cont'}>{modelsPrepared}</div>;
    };
    const similarDOM = similar ? similar.map((el, index) => {
        console.log(el.models)
        return {
            data: <D bid={el.bid} models={el.models} />,
            /*value: <S models={el.models} />,*/
        };
    }) : null;

    return (
        <div className={'sa-find-similar'}>
            <div className={'sa-find-similar-info'}>
                <div className={'sa-position__one'}>
                    <div style={{padding: "0", width: "100%"}}>
                        <Table
                            columns={settingsColumns}
                            dataSource={defaultSimilarAddData}
                            pagination={false}
                            size={"small"}
                            showHeader={true}
                            bordered={true}
                        />
                    </div>
                    <div style={{margin: "20px 0 0", width: "100%"}}>
                        <Table
                            columns={modelsColumns(change)}
                            dataSource={similarData}
                            pagination={false}
                            bordered={true}
                            size={"small"}
                            scroll={{
                                y: 250,
                            }}
                        />
                    </div>
                </div>
                {/*<div className={'sa-similar__tab__container'}>
                    <Input
                        style={{width: "350px", margin: "0 0 10px"}}
                        placeholder={"Введите поисковый запрос..."}
                        value={text}
                        onChange={(t) => setText(t.target.value)}
                    />
                    <div style={{margin: "10px auto"}}>
                        <Segmented
                            options={searchStringTypeOptions}
                            size={"small"}
                            value={searchType}
                            onChange={(value) => {
                                setSearchType(value); // string
                            }}
                        />
                    </div>

                    <div style={{marginTop: "10px"}}>
                        <Button onClick={(_) => setChildrenDrawer(true)}>
                            НАЙТИ ПОХОЖИЕ ЗАЯВКИ
                        </Button>
                    </div>
                </div>*/}
            </div>
            <div className={'sa-find-similar-founded'}>
                <Table
                    loading={load}
                    dataSource={similarDOM}
                    columns={DS_SIMILAR_COLUMNS}
                    pagination={false}
                    size={"small"}
                    showHeader={true}
                    bordered={true}
                    scroll={{ x: true, y: 515 }}
                />
            </div>
        </div>
    );
};

export default FindSimilar;
