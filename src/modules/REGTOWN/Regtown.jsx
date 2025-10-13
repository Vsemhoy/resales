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
import CustomInput from "./components/CustomInput";
import {PRICE as region} from "../PRICE/mock/mock";

const Regtown = (props) => {

    const [isMounted, setIsMounted] = useState(false);
    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [isLoadingTowns, setIsLoadingTowns] = useState(false);

    const [userData, setUserData] = useState(null);

    const [regionsSearchStr, setRegionsSearchStr] = useState(null);
    const [townSearchStr, setTownSearchStr] = useState(null);


    const [regions, setRegions] = useState(null);
    const [sortedRegions, setSortedRegions] = useState(null);

    const [townsByRegions, setTownsByRegions] = useState(null);
    const [sortedTownsByRegions, setSortedTownsByRegions] = useState(null);

    const [selectedRegion, setSelectedRegion] = useState(null);

    const [editSelectedRegion, setEditSelectedRegion] = useState(null);
    const [addedRegion, setAddedRegion] = useState(null);

    const [editSelectedTown, setEditSelectedTown] = useState(null);
    const [addedTown, setAddedTown] = useState(null);

    const [selectedRegionSelect, setSelectedRegionSelect] = useState(null);

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
        if (props.userdata) {
            setUserData(props.userdata);
        }
    }, [props.userdata]);

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

    useEffect(() => {
        if (isAlertVisible && alertType !== 'error') {
            const timer = setTimeout(() => {
                setIsAlertVisible(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isAlertVisible]);

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
                        <CustomInput id={option.id}
                                     name={option.name}
                                     editSelectedRegion={editSelectedRegion}
                                     updateName={(name) => handleUpdateRegion(option, name)}
                                     radioBtn={true}
                        />
                        {option.id !== editSelectedRegion ? (
                            <Tooltip title={'Редактировать'}>
                                <Button icon={<EditOutlined />}
                                        color="primary"
                                        variant="filled"
                                        disabled={idDisabled()}
                                        onClick={() => setEditSelectedRegion(option.id)}
                                ></Button>
                            </Tooltip>
                        ) : (
                            <Tooltip title={'Сохранить'}>
                                <Button icon={<CheckOutlined />}
                                        color="primary"
                                        onClick={() => regionUpdate(option)}
                                ></Button>
                            </Tooltip>
                        )}
                        {option.id !== editSelectedRegion ? (
                            <Tooltip title={'В архив'}>
                                <Button icon={<InboxOutlined />}
                                        color="danger"
                                        variant="filled"
                                        disabled={idDisabled()}
                                        onClick={() => handleDeleteRegion(option.id)}
                                ></Button>
                            </Tooltip>
                        ) : (
                            <Tooltip title={'Отмена'}>
                                <Button icon={<CloseOutlined />}
                                        color="danger"
                                        onClick={() => handleCloseEditRegion()}
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
                    data: addedRegion,
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
                    data: addedTown,
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
    const regionUpdate = async (region) => {
        if (PRODMODE) {
            const path = `/api/regiontown/regions/update/${region.id}`;
            try {
                let response = await PROD_AXIOS_INSTANCE.post(path, {
                    data: region,
                    _token: CSRF_TOKEN,
                });
                if (response.data) {
                    setIsAlertVisible(true);
                    setAlertMessage('Успех!');
                    setAlertDescription(response.data.message);
                    setAlertType('success');

                    fetchRegions().then();
                    setEditSelectedRegion(null);
                }
            } catch (e) {
                console.log(e);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }
        } else {
            setEditSelectedRegion(null);
        }
    };
    const townUpdate = async (town) => {
        if (PRODMODE) {
            const path = `/api/regiontown/towns/update/${town.id}`;
            try {
                let response = await PROD_AXIOS_INSTANCE.post(path, {
                    data: {
                        ...town,
                        id_region: selectedRegionSelect ?? selectedRegion
                    },
                    _token: CSRF_TOKEN,
                });
                if (response.data) {
                    setIsAlertVisible(true);
                    setAlertMessage('Успех!');
                    setAlertDescription(response.data.message);
                    setAlertType('success');

                    fetchTownsByRegions().then();
                    setEditSelectedTown(null);
                }
                setSelectedRegionSelect(null);
            } catch (e) {
                console.log(e);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }
        } else {
            setEditSelectedTown(null);
        }
    };

    const handleUpdateRegion = (region, name) => {
        const regionsUpd = JSON.parse(JSON.stringify(sortedRegions));
        const regionIdx = regionsUpd.findIndex(r => r.id === region.id);
        regionsUpd[regionIdx].name = name;
        setSortedRegions(regionsUpd);
    };

    const handleUpdateTown = (town, name) => {
        const townsUpd = JSON.parse(JSON.stringify(sortedTownsByRegions));
        const townIdx = townsUpd.findIndex(r => r.id === town.id);
        townsUpd[townIdx].name = name;
        setSortedTownsByRegions(townsUpd);
    };

    const handleCloseEditRegion = () => {
        const regionsUpd = JSON.parse(JSON.stringify(sortedRegions));
        const reg = regionsUpd.find(r => r.id === editSelectedRegion);
        const regSer = regions.find(r => r.id === editSelectedRegion);
        reg.name = regSer.name;
        setSortedRegions(regionsUpd);
        setEditSelectedRegion(null);
    };

    const handleCloseEditTown = () => {
        const townsUpd = JSON.parse(JSON.stringify(sortedTownsByRegions));
        const tow = townsUpd.find(r => r.id === editSelectedTown);
        const towSer = townsByRegions.find(r => r.id === editSelectedTown);
        tow.name = towSer.name;
        setSortedTownsByRegions(townsUpd);
        setEditSelectedTown(null);
    };

    const handleDeleteRegion = async (regionId) => {
        if (PRODMODE) {
            const path = `/api/regiontown/regions/${regionId}`;
            try {
                let response = await PROD_AXIOS_INSTANCE.delete(path, {
                    _token: CSRF_TOKEN,
                });
                if (response.data) {
                    setIsAlertVisible(true);
                    setAlertMessage('Успех!');
                    setAlertDescription(response.data.message);
                    setAlertType('success');

                    fetchRegions().then();
                    //setEditSelectedRegion(null);
                }
            } catch (e) {
                console.log(e);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }
        } else {
            //setEditSelectedRegion(null);
        }
    };

    const handleDeleteTown = async (townId) => {
        if (PRODMODE) {
            const path = `/api/regiontown/towns/${townId}`;
            try {
                let response = await PROD_AXIOS_INSTANCE.delete(path, {
                    _token: CSRF_TOKEN,
                });
                if (response.data) {
                    setIsAlertVisible(true);
                    setAlertMessage('Успех!');
                    setAlertDescription(response.data.message);
                    setAlertType('success');

                    fetchTownsByRegions().then();
                }
                //setSelectedRegionSelect(null);
            } catch (e) {
                console.log(e);
                setIsAlertVisible(true);
                setAlertMessage(`Произошла ошибка! ${path}`);
                setAlertDescription(e.response?.data?.message || e.message || 'Неизвестная ошибка');
                setAlertType('error');
            }
        } else {
            //setEditSelectedTown(null);
        }
    };

    const idDisabled = () => {
        return !(userData?.user?.super === 1 || userData?.acls?.includes(150));
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
                                disabled={idDisabled()}
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
                                disabled={!selectedRegion || idDisabled()}
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
                                        {/*<Input value={town.name}
                                               readOnly={(town.id !== editSelectedTown)}
                                        />*/}
                                        <CustomInput id={town.id}
                                                     name={town.name}
                                                     editSelectedTown={editSelectedTown}
                                                     updateName={(name) => handleUpdateTown(town, name)}
                                        />
                                        {town.id !== editSelectedTown ? (
                                            <Tooltip title={'Перенести в другой регион'}>
                                                <Popover
                                                    content={
                                                        <div style={{display: 'flex', gap: '8px'}}>
                                                            <Select style={{width: '200px'}}
                                                                    placeholder={'Выберите новый регион'}
                                                                    value={selectedRegionSelect}
                                                                    options={prepareSelect(regions)}
                                                                    onChange={setSelectedRegionSelect}
                                                            />
                                                            <Button color={'primary'}
                                                                    onClick={() => townUpdate(town)}
                                                            >ОК</Button>
                                                        </div>
                                                    }
                                                    trigger="click"
                                                    placement={'bottomLeft'}
                                                >
                                                    <Button icon={<RollbackOutlined/>}
                                                            color="purple"
                                                            variant="filled"
                                                            disabled={idDisabled()}
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
                                                        disabled={idDisabled()}
                                                        onClick={() => setEditSelectedTown(town.id)}
                                                ></Button>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title={'Сохранить'}>
                                                <Button icon={<CheckOutlined/>}
                                                        color="primary"
                                                        onClick={() => townUpdate(town)}
                                                ></Button>
                                            </Tooltip>
                                        )}
                                        {town.id !== editSelectedTown ? (
                                            <Tooltip title={'В архив'}>
                                                <Button icon={<InboxOutlined/>}
                                                        color="danger"
                                                        variant="filled"
                                                        disabled={idDisabled()}
                                                        onClick={() => handleDeleteTown(town.id)}
                                                ></Button>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title={'Отмена'}>
                                                <Button icon={<CloseOutlined/>}
                                                        color="danger"
                                                        onClick={() => handleCloseEditTown()}
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
