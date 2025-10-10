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

    const [regionsSearchStr, setRegionsSearchStr] = useState(null);
    const [townSearchStr, setTownSearchStr] = useState(null);


    const [regions, setRegions] = useState(null);
    const [sortedRegions, setSortedRegions] = useState(null);

    const [townsByRegions, setTownsByRegions] = useState(null);
    const [sortedTownsByRegions, setSortedTownsByRegions] = useState(null);

    const [selectedRegion, setSelectedRegion] = useState(null);

    const [editSelectedRegion, setEditSelectedRegion] = useState(null);
    const [editSelectedRegionName, setEditSelectedRegionName] = useState(null);
    const [addedRegion, setAddedRegion] = useState(null);

    const [editSelectedTown, setEditSelectedTown] = useState(null);
    const [editSelectedTownName, setEditSelectedTownName] = useState(null);
    const [addedTown, setAddedTown] = useState(null);

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
        if (addedTown && selectedRegion) {
            setAddedTown({
                ...addedTown,
                "id_region": selectedRegion,
            });
        }
        if (addedTown && !selectedRegion) {
            setAddedTown(null);
        }
    }, [selectedRegion]);

    useEffect(() => {
        if (isMounted) {
            if (regionsSearchStr) {
                setSortedRegions(regions.filter(reg => reg.name.toLowerCase().includes(regionsSearchStr.toLowerCase())));
            } else {
                setSortedRegions(regions);
            }
        }
    }, [regionsSearchStr]);

    useEffect(() => {
        if (isMounted) {
            const timer = setTimeout(() => {
                if (townSearchStr && !selectedRegion) {
                    fetchTownsByRegions().then();
                } else if (townSearchStr && selectedRegion) {
                    setSortedTownsByRegions(townsByRegions.filter(town => {
                        console.log(town.name.toLowerCase())
                        console.log(townSearchStr.toLowerCase())
                        return town.name.toLowerCase().includes(townSearchStr.toLowerCase())
                    }));
                } else if (!townSearchStr && !selectedRegion) {
                    setSortedTownsByRegions(null);
                } else if (!townSearchStr && selectedRegion) {
                    setSortedTownsByRegions(townsByRegions);
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [townSearchStr]);

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
                    setSortedRegions(response.data?.content?.regions);
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
            setSortedRegions(REGIONS);
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
                        'region': selectedRegion,
                        'town': townSearchStr
                    },
                    _token: CSRF_TOKEN,
                });
                if (response.data?.content) {
                    setTownsByRegions(response.data?.content?.towns);
                    setSortedTownsByRegions(response.data?.content?.towns);
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
            setSortedTownsByRegions(TOWNS);
            setTimeout(() => setIsLoadingTowns(false), 500);
        }
    };

    const prepareRadioOptions = (options) => {
        return options?.sort((a, b) => a.name.localeCompare(b.name))?.map((option) => {
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
                                        //onClick={() => setEditSelectedTown(town.id)}
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

    const handleAddRegion = () => {
         setAddedRegion({
            "id": 0,
            "name": ""
        });
    };
    const handleAddTown = () => {
        setAddedTown({
            "id_region": selectedRegion,
            "name": "",
            "id": 0
        });
    };
    const handleUpdateAddedRegionName = (name) => {
        setAddedRegion({
            "id": 0,
            "name": name
        });
    };
    const handleUpdateAddedTownName = (name) => {
        setAddedTown({
            "id_region": selectedRegion,
            "name": name,
            "id": 0
        });
    };
    const saveNewRegion = async () => {
        if (PRODMODE) {
            const path = `/api/regiontown/regions/create`;
            // setIsLoadingRegions(true);
            try {
                let response = await PROD_AXIOS_INSTANCE.post(path, {
                    addedRegion,
                    _token: CSRF_TOKEN,
                });
                if (response.data) {
                    setIsAlertVisible(true);
                    setAlertMessage('Успех!');
                    setAlertDescription(response.data.message);
                    setAlertType('success');

                    fetchRegions().then();

                    setAddedTown(null);
                }
                // setIsLoadingRegions(false);
            } catch (e) {
                console.log(e);
                // setIsLoadingRegions(false);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }
        } else {
            setAddedRegion(null);
        }
    };
    const saveNewTown = async () => {
        if (PRODMODE) {
            const path = `/api/regiontown/towns/create`;
            // setIsLoadingTowns(true);
            try {
                let response = await PROD_AXIOS_INSTANCE.post(path, {
                    addedTown,
                    _token: CSRF_TOKEN,
                });
                if (response.data) {
                    setIsAlertVisible(true);
                    setAlertMessage('Успех!');
                    setAlertDescription(response.data.message);
                    setAlertType('success');

                    fetchTownsByRegions().then();

                    setAddedTown(null);
                }
                // setIsLoadingTowns(false);
            } catch (e) {
                console.log(e);
                // setIsLoadingTowns(false);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }
        } else {
            setAddedTown(null);
        }
    };
    const regionUpdate = () => {
        if (PRODMODE) {
            const path = `/api/regiontown/regions/update/`;
            try {

            } catch (e) {
                console.log(e);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }
        } else {

        }
    };
    const townUpdate = () => {
        if (PRODMODE) {
            const path = `/api/regiontown/towns/update/`;
            try {

            } catch (e) {
                console.log(e);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }
        } else {

        }
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
                               value={regionsSearchStr}
                               onChange={(e) => setRegionsSearchStr(e.target.value)}
                               prefix={<SearchOutlined />}
                               allowClear
                        />
                        <Button color={'primary'}
                                variant={'solid'}
                                icon={<PlusOutlined />}
                                onClick={handleAddRegion}
                        >Добавить регион</Button>
                    </div>
                    <div style={{padding: '0 10px'}}><Divider /></div>
                    <div className={'sa-regions-body'}>
                        <Spin spinning={isLoadingRegions}>
                            {Boolean(addedRegion) && (
                                <div className={'sa-regions-body-item'} style={{width:'auto', padding: '0 12px'}}>
                                    <Input value={addedRegion.name}
                                           onChange={(e) => handleUpdateAddedRegionName(e.target.value)}
                                           placeholder={'Введите название региона'}
                                    />
                                    <Tooltip title={'Сохранить'}>
                                        <Button icon={<CheckOutlined/>}
                                                color="primary"
                                                onClick={() => saveNewRegion()}
                                        ></Button>
                                    </Tooltip>
                                    <Tooltip title={'Отмена'}>
                                        <Button icon={<CloseOutlined/>}
                                                color="danger"
                                                onClick={() => setAddedRegion(null)}
                                        ></Button>
                                    </Tooltip>
                                </div>
                            )}
                            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '10px'}}>
                                <Button disabled={!selectedRegion}
                                        color={'purple'}
                                        onClick={() => setSelectedRegion(null)}
                                >Отменить выбранный регион</Button>
                            </div>
                            {regions ? (
                                <Radio.Group value={selectedRegion}
                                             options={prepareRadioOptions(sortedRegions)}
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
                               value={townSearchStr}
                               onChange={(e) => setTownSearchStr(e.target.value)}
                               allowClear
                        />
                        <Button color={'primary'}
                                variant={'solid'}
                                icon={<PlusOutlined/>}
                                disabled={!selectedRegion}
                                onClick={handleAddTown}
                        >Добавить город в регион</Button>
                    </div>
                    <div style={{padding: '0 10px'}}><Divider/></div>
                    <div className={'sa-towns-body'}>
                        <Spin spinning={isLoadingTowns}>
                            {Boolean(addedTown) && (
                                <div className={'sa-towns-body-item'}>
                                    <Input value={addedTown.name}
                                           onChange={(e) => handleUpdateAddedTownName(e.target.value)}
                                           placeholder={'Введите название города'}
                                    />
                                    <div></div>
                                    <Tooltip title={'Сохранить'}>
                                        <Button icon={<CheckOutlined/>}
                                                color="primary"
                                                onClick={() => saveNewTown()}
                                        ></Button>
                                    </Tooltip>
                                    <Tooltip title={'Отмена'}>
                                        <Button icon={<CloseOutlined/>}
                                                color="danger"
                                                onClick={() => setAddedTown(null)}
                                        ></Button>
                                    </Tooltip>
                                </div>
                            )}
                            <div className={'sa-towns-body sa-towns-body-s'}>
                                {townsByRegions ? sortedTownsByRegions?.sort((a, b) => a.name.localeCompare(b.name))?.map((town, idx) => (
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
                                                                    placeholder={'Выберите новый регион'}
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
                                    <Empty description={'Выберите регион'}/>
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
