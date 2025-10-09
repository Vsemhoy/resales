import React, {useEffect, useState} from 'react';
import {Affix, Alert, Button, Divider, Empty, Input, Popover, Radio, Select, Spin, Tag, Tooltip, Upload} from "antd";
import './components/styles/styles.css'
import {
    CheckOutlined, CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    InboxOutlined,
    PlusOutlined,
    RollbackOutlined,
    SearchOutlined, UploadOutlined
} from "@ant-design/icons";
import {CSRF_TOKEN, PRODMODE} from "../../config/config";
import {REGIONS, TOWNS} from "./mock/mock";
import {PROD_AXIOS_INSTANCE} from "../../config/Api";

const Regtown = () => {

    const [isMounted, setIsMounted] = useState(false);
    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [isLoadingTowns, setIsLoadingTowns] = useState(false);

    const [regions, setRegions] = useState(null);
    const [townsByRegions, setTownsByRegions] = useState(null);

    const [selectedRegion, setSelectedRegion] = useState(null);

    const [editSelectedRegion, setEditSelectedRegion] = useState(null);
    const [editSelectedRegionName, setEditSelectedRegionName] = useState(null);

    const [editSelectedTown, setEditSelectedTown] = useState(null);
    const [editSelectedTownName, setEditSelectedTownName] = useState(null);

    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertDescription, setAlertDescription] = useState('');
    const [alertType, setAlertType] = useState('');

    useEffect(() => {
        if (!isMounted) {
            fetchRegions().then(() => {
                setIsMounted(true);
            });
        }
    }, []);

    useEffect(() => {
        if (isMounted && selectedRegion) {
            fetchTownsByRegions().then();
        } else {
            setTownsByRegions(null);
        }
    }, [selectedRegion]);

    /*
    * setIsAlertVisible(true);
					setAlertMessage('Успех!');
					setAlertDescription(response.data.message);
					setAlertType('success');*/

    const fetchRegions = async () => {
        if (PRODMODE) {
            const path = `/api/regiontown/regions`;
            setIsLoadingRegions(true);
            try {
                let response = await PROD_AXIOS_INSTANCE.post(path, {
                    _token: CSRF_TOKEN,
                });
                if (response.data?.content) {
                    setRegions(response.data?.content?.regions);
                }
                setIsLoadingRegions(false);
            } catch (e) {
                console.log(e);
                setIsLoadingRegions(false);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }
        } else {
            setIsLoadingRegions(true);
            setRegions(REGIONS);
            setTimeout(() => setIsLoadingRegions(false), 500);
        }
    };

    const fetchTownsByRegions = async () => {
        if (PRODMODE) {
            const path = `/api/regiontown/towns`;
            setIsLoadingTowns(true);
            try {
                let response = await PROD_AXIOS_INSTANCE.post(path, {
                    data: {
                        'region': selectedRegion
                    },
                    _token: CSRF_TOKEN,
                });
                if (response.data?.content) {
                    setTownsByRegions(response.data?.content?.towns);
                }
                setIsLoadingTowns(false);
            } catch (e) {
                console.log(e);
                setIsLoadingTowns(false);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }
        } else {
            setIsLoadingTowns(true);
            setTownsByRegions(TOWNS);
            setTimeout(() => setIsLoadingTowns(false), 500);
        }
    };

    const prepareRadioOptions = (options) => {
        return options?.sort((a,b) => a.name - b.name).map((option) => {
            return {
                value: option.id,
                label: (
                    <div className={'sa-regions-body-item'}>
                        <Input value={option.name}
                               onChange={() => console.log(111111)}
                               readOnly={(option.id !== editSelectedRegion)}
                               onClick={(e) => {
                                   e.target.closest('.sa-regions-body-item').click();
                                   e.stopPropagation()
                                   e.target.focus();
                               }}
                        />
                        {option.id !== editSelectedRegion ? (
                            <Tooltip title={'Редактировать'}>
                                <Button icon={<EditOutlined />}
                                        color="primary"
                                        variant="filled"
                                        onClick={() => setEditSelectedRegion(option.id)}
                                ></Button>
                            </Tooltip>
                        ) : (
                            <Tooltip title={'Сохранить'}>
                                <Button icon={<CheckOutlined />}
                                        color="primary"
                                    // onClick={() => setEditSelectedTown(town.id)}
                                ></Button>
                            </Tooltip>
                        )}
                        {option.id !== editSelectedRegion ? (
                            <Tooltip title={'В архив'}>
                                <Button icon={<InboxOutlined />}
                                        color="danger"
                                        variant="filled"
                                ></Button>
                            </Tooltip>
                        ) : (
                            <Tooltip title={'Отмена'}>
                                <Button icon={<CloseOutlined />}
                                        color="danger"
                                        onClick={() => setEditSelectedRegion(null)}
                                ></Button>
                            </Tooltip>
                        )}
                    </div>
                ),
            }
        })
    };

    const prepareSelect = (options) => {
        return options?.sort((a,b) => a.name - b.name).map((option) => {
            return {
                value: option.id,
                label: option.name
            }
        })
    };

    return (
        <div className={'sa-regtown'}>
            <div style={{padding: '10px 12px 0 12px'}}>
                <div className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}
                     style={{margin: 0, height: '109px'}}
                >
                    <div className={'sa-header-label-container'}>
                        <h1 className={`sa-header-label`} style={{width:'290px'}}>Города и регионы</h1>
                    </div>
                </div>
            </div>

            <div className={'sa-regtown-container'}>
                <div className={'sa-regtown-regions'}>
                    <div className={'sa-regtown-header'}>Регионы</div>
                    <div className={'sa-regtown-events-container'}>
                        <Input placeholder={'Поиск по регионам...'}
                               prefix={<SearchOutlined />}
                               allowClear
                        />
                        <Button color={'primary'}
                                variant={'solid'}
                                icon={<PlusOutlined />}
                        >Добавить регион</Button>
                    </div>
                    <div style={{padding: '0 10px'}}><Divider /></div>
                    <div className={'sa-regions-body'}>
                        <Spin spinning={isLoadingRegions}>
                            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '10px'}}>
                                <Button disabled={!selectedRegion}
                                        color={'purple'}
                                        onClick={() => setSelectedRegion(null)}
                                >Отменить выбранный регион</Button>
                            </div>
                            {regions ? (
                                <Radio.Group value={selectedRegion}
                                             options={prepareRadioOptions(regions)}
                                             onChange={(e) => setSelectedRegion(e.target.value)}
                                             style={{
                                                 display: 'flex',
                                                 flexDirection: 'column',
                                                 gap: 8,
                                             }}
                                />
                            ) : (
                                <Empty />
                            )}
                        </Spin>
                    </div>
                </div>

                <div className={'sa-regtown-towns'}>
                    <div className={'sa-regtown-header'}>
                        {selectedRegion ?
                            (<div>Города в <Tag>{regions.find(reg => +reg.id === +selectedRegion)?.name}</Tag></div>) :
                            ('Города')
                        }
                    </div>
                    <div className={'sa-regtown-events-container'}>
                        <Input placeholder={selectedRegion ? 'Поиск по городам в регионе...' : 'Поиск по городам...'}
                               prefix={<SearchOutlined/>}
                               allowClear
                        />
                        <Button color={'primary'}
                                variant={'solid'}
                                icon={<PlusOutlined/>}
                                disabled={!selectedRegion}
                        >Добавить город в регион</Button>
                    </div>
                    <div style={{padding: '0 10px'}}><Divider/></div>
                    <div className={'sa-towns-body'}>
                        <Spin spinning={isLoadingTowns}>
                            <div className={'sa-towns-body sa-towns-body-s'}>
                                {townsByRegions ? townsByRegions?.sort((a,b) => a.name - b.name)?.map((town, idx) => (
                                    <div className={'sa-towns-body-item'} key={`towns-${town.id}-${idx}`}>
                                        <Input value={town.name}
                                               readOnly={(town.id !== editSelectedTown)}
                                        />
                                        {town.id !== editSelectedTown ? (
                                            <Tooltip title={'Перенести в другой регион'}>
                                                <Popover
                                                    content={
                                                        <div style={{display: 'flex', gap: '8px'}}>
                                                            <Select style={{width: '200px'}}
                                                                    options={prepareSelect(regions)}
                                                            />
                                                            <Button color={'primary'}>ОК</Button>
                                                        </div>
                                                    }
                                                    trigger="click"
                                                    placement={'bottomLeft'}
                                                >
                                                    <Button icon={<RollbackOutlined/>}
                                                            color="purple"
                                                            variant="filled"
                                                    ></Button>
                                                </Popover>
                                            </Tooltip>
                                        ) : (
                                            <div></div>
                                        )}
                                        {town.id !== editSelectedTown ? (
                                            <Tooltip title={'Редактировать'}>
                                                <Button icon={<EditOutlined/>}
                                                        color="primary"
                                                        variant="filled"
                                                        onClick={() => setEditSelectedTown(town.id)}
                                                ></Button>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title={'Сохранить'}>
                                                <Button icon={<CheckOutlined/>}
                                                        color="primary"
                                                    // onClick={() => setEditSelectedTown(town.id)}
                                                ></Button>
                                            </Tooltip>
                                        )}
                                        {town.id !== editSelectedTown ? (
                                            <Tooltip title={'В архив'}>
                                                <Button icon={<InboxOutlined/>}
                                                        color="danger"
                                                        variant="filled"
                                                ></Button>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title={'Отмена'}>
                                                <Button icon={<CloseOutlined/>}
                                                        color="danger"
                                                        onClick={() => setEditSelectedTown(null)}
                                                ></Button>
                                            </Tooltip>
                                        )}
                                    </div>
                                )) : (
                                    <Empty/>
                                )}
                            </div>
                        </Spin>
                    </div>
                </div>

            </div>
            {isAlertVisible && (
                <Alert
                    message={alertMessage}
                    description={alertDescription}
                    type={alertType}
                    showIcon
                    closable
                    style={{
                        position: 'fixed',
                        top: 20,
                        right: 20,
                        zIndex: 9999,
                        width: 350,
                    }}
                    onClose={() => setIsAlertVisible(false)}
                />
            )}
        </div>
    );
};

export default Regtown;
