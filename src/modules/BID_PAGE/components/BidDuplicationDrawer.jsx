import React, {useEffect, useState} from 'react';
import {AutoComplete, Drawer, Tag} from "antd";
import {BASE_ROUTE, CSRF_TOKEN, PRODMODE, ROUTE_PREFIX} from "../../../config/config";
import {PROD_AXIOS_INSTANCE} from "../../../config/Api";
import {ORG_SUGGESTIONS} from "../mock/mock";
import {CopyOutlined, FileSyncOutlined, LoadingOutlined} from "@ant-design/icons";

const BidDuplicationDrawer = (props) => {
   const [selectedOrg, setSelectedOrg] = useState(null);
   const [orgsSuggestions, setOrgsSuggestions] = useState([]);
   const [searchText, setSearchText] = useState('');
   const [isLoadingAutoComplete, setIsLoadingAutoComplete] = useState(false);
   const [bidId, setBidId] = useState(null);
   const [bidType, setBidType] = useState(null);

    useEffect(() => {
        if (props.bidId) {
            setBidId(props.bidId);
        }
    }, [props.bidId]);

    useEffect(() => {
        if (props.bidType) {
            setBidType(props.bidType);
        }
    }, [props.bidType]);

    useEffect(() => {
        if (props.isOpenDrawer) {
            const timer = setTimeout(() => {
                setIsLoadingAutoComplete(true);
                fetchOrgs().then(() => {
                    setTimeout(() => setIsLoadingAutoComplete(false), 500);
                });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchText]);

    const fetchOrgs = async () => {
        if (PRODMODE) {
            const path = `${ROUTE_PREFIX}/sales/data/getorgsuggestions`;
            try {
                let response = await PROD_AXIOS_INSTANCE.post(path, {
                    data: {
                        text: searchText
                    },
                    _token: CSRF_TOKEN,
                });
                if (response.data && response.data.suggestions) {
                    setOrgsSuggestions(response.data.suggestions);
                } else {
                    setOrgsSuggestions([]);
                }
            } catch (e) {
                console.log(e);
                props.error_alert(path, e);
            }
        } else {
            if (searchText) {
                setOrgsSuggestions(ORG_SUGGESTIONS);
            } else {
                setOrgsSuggestions([]);
            }
        }
    };

    const createDuplicate = async (type) => {
        if (PRODMODE) {
            const path = `${ROUTE_PREFIX}/sales/data/makebid`;
            try {
                let response = await PROD_AXIOS_INSTANCE.post(path, {
                    data: {
                        bid: bidId,
                        org: selectedOrg.orgData.value,
                        type
                    },
                    _token: CSRF_TOKEN,
                });
                if (response.data.message === "OK" && response.data.item_id) {
                    window.open(`${BASE_ROUTE}/bids/${response.data.item_id}`, '_blank');
                }
            } catch (e) {
                console.log(e);
                props.error_alert(path, e);
            }
        }
    };

    return (
        <Drawer
            title={`Дублирование`}
            placement="right"
            width={600}
            onClose={() => props.closeDrawer()}
            open={props.isOpenDrawer}
        >
            <div>
                <AutoComplete
                    value={searchText}
                    options={isLoadingAutoComplete ? [] : orgsSuggestions.map(org => ({
                        value: org.name,
                        label: (
                            <div>
                                <div>{org.name}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {org.town}
                                </div>
                            </div>
                        ),
                        orgData: org
                    }))}
                    onSelect={(e, value) => setSelectedOrg(value)}
                    onSearch={setSearchText}
                    onChange={(e, value) => {
                        if (value?.value) {
                            setSearchText(value.value);
                        } else {
                            setSearchText('');
                            setOrgsSuggestions([]);
                            setSelectedOrg(null);
                        }
                    }}
                    allowClear
                    placeholder={"Поиск организации"}
                    variant={"outlined"}
                    style={{width: "100%"}}
                    notFoundContent={isLoadingAutoComplete ? <LoadingOutlined /> : "Ничего не найдено"}
                />

                {selectedOrg && (
                    <div>
                        <div className={'sa-duplication-header-block'}>
                            <Tag style={{fontSize: "12px"}}>{selectedOrg.orgData.value}</Tag>
                            <span style={{padding: "0", fontWeight: "500"}}>{selectedOrg.orgData.name}</span>
                            <span style={{paddingLeft: "5px", color: "#adadad"}}>{selectedOrg.orgData.town}</span>
                        </div>
                        <div className={'sa-duplication-choose-block-wrapper'}>
                            <div className={'sa-duplication-choose-block'}
                                 onClick={() => createDuplicate(bidType)}
                            >
                                <CopyOutlined className={'sa-duplication-icon'}/>
                                {bidType === 1 && (
                                    <span className={'sa-duplication-choose-block-span'}>Дублировать<span style={{fontWeight: 500}}>{` коммерческое предложение`}</span></span>
                                )}
                                {bidType === 2 && (
                                    <span className={'sa-duplication-choose-block-span'}>Дублировать<span style={{fontWeight: 500}}>{` заявку на счёт`}</span></span>
                                )}
                            </div>
                            <div
                                className={'sa-duplication-choose-block'}
                                onClick={() => createDuplicate(bidType === 1 ? 2 : 1)}
                            >
                                <FileSyncOutlined className={'sa-duplication-icon'}/>
                                {bidType === 2 && (
                                    <span className={'sa-duplication-choose-block-span'}>Дублировать и преобразовать в<span style={{fontWeight: 500}}>{` коммерческое предложение`}</span></span>
                                )}
                                {bidType === 1 && (
                                    <span className={'sa-duplication-choose-block-span'}>Дублировать и преобразовать в{" "}<span style={{fontWeight: 500}}>{` заявку на счёт`}</span></span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Drawer>
    );
};

export default BidDuplicationDrawer;
