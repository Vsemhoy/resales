import React, {useEffect, useState} from 'react';
import {Affix, Button, Layout, Pagination, Select, Spin, Tag, Tooltip} from "antd";
import CurrencyMonitorBar from "../../components/template/CURRENCYMONITOR/CurrencyMonitorBar";
import {CaretLeftFilled, CloseOutlined, FilterOutlined} from "@ant-design/icons";
import RemoteSearchSelect from "../BID_LIST/components/RemoteSearchSelect";
import Sider from "antd/es/layout/Sider";
import BidListSiderFilters from "../BID_LIST/components/BidListSiderFilters";
import {Content} from "antd/es/layout/layout";
import {NavLink} from "react-router-dom";
import {ANTD_PAGINATION_LOCALE} from "../../config/Localization";
import CuratorListTable from "./components/CuratorListTable";
import {CSRF_TOKEN, PRODMODE} from "../../config/config";
import {CONFIRM_LIST} from "./mock/mock";
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import './components/style/curatorlistpage.css';


const CuratorPage = (props) => {
    const [openedFilters, setOpenedFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [supervisor, setSupervisor] = useState(false);

    const [companies, setCompanies] = useState([]);

    const fetchInfo = async () => {
        setIsLoading(true);
        await fetchNeedCuratorsApproved();
        // await fetchBids();
        setIsLoading(false);
    };

    useEffect(() => {
        fetchInfo().then();
        // if (showGetItem !== null){
        //     handlePreviewOpen(showGetItem);
        //     setTimeout(() => {
        //
        //         setShowParam(showGetItem);
        //     }, 2200);
        // }
        setIsMounted(true);
    }, []);

    const handlePreviewOpen = (item, state) => {
        console.log('HELLO', item);
        // setShowParam(item);
        // setPreviewItem(item);
        // setIsPreviewOpen(true);
    }

    const fetchNeedCuratorsApproved = async () => {
        if (PRODMODE){
            let response = await PROD_AXIOS_INSTANCE.post('/api/curators/show', {
                _token: CSRF_TOKEN
            });
            setCompanies(response.data.orders);
            setSupervisor(response.data.supervisor);
        } else {
            setCompanies(CONFIRM_LIST);
            setSupervisor(true);
        }
    }

    const approve = async (status, id) => {
        setButtonLoading(true);
        if (PRODMODE){
            let response = await PROD_AXIOS_INSTANCE.put('/api/curators/approved/' + id, {
                status: status,
                _token: CSRF_TOKEN
            });

            await fetchNeedCuratorsApproved();
            setButtonLoading(false);
        } else {
            console.log("All is good", status, id);
            setButtonLoading(false);

        }

    }

    if (isLoading) return <Spin spinning={isLoading} style={{marginTop: "150px"}}></Spin>

    return (
        <div className={`app-page sa-app-page ${openedFilters ? "sa-filer-opened" : ''}`}>
            <Layout className={'sa-layout sa-w-100'}>
                <Content>
                    {/*<Affix offsetTop={100}>*/}
                        <div className={'sa-pagination-panel sa-pa-12-24 sa-back'}>
                            <div className={'sa-flex-space'}>
                                <div className={'sa-flex-gap'}>
                                    <Tooltip title="Я временный куратор">
                                        <Button color="default" variant={false ? "solid" : "outlined"}
                                            // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
                                        >Временные</Button>
                                    </Tooltip>
                                    <Tooltip title="Компании с моим кураторством">
                                        <Button color="default" variant={false ? "solid" : "outlined"}
                                            // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
                                        >Мои</Button>
                                    </Tooltip>
                                    {/* <Button type={'primary'} icon={<PlusOutlined/>}>Добавить</Button> */}
                                </div>
                            </div>
                        </div>
                    {/*</Affix>*/}


                    <Spin spinning={isLoading}>
                        <CuratorListTable
                            companies={companies}
                            supervisor={supervisor}
                            buttonLoading={buttonLoading}
                            // bids={bids}
                            on_preview_open={handlePreviewOpen}
                            approve={approve}
                            // on_set_sort_orders={setOrderBox}
                        />
                    </Spin>
                </Content>

            </Layout>
            {/* <OrgListPreviewModal
            is_open={isPreviewOpen}
            data={previewItem}
            on_close={()=>{setIsPreviewOpen(false)}}
            /> */}
        </div>
    );
}


export default CuratorPage;