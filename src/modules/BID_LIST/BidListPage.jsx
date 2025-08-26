import React, { useEffect, useState } from 'react';

import './components/style/bidlistpage.css';
import {CSRF_TOKEN, PRODMODE} from '../../config/config';
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import {Affix, Button, DatePicker, Dropdown, Input, Layout, Pagination, Select, Spin, Tag, Tooltip} from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { DocumentPlusIcon } from '@heroicons/react/16/solid';
import { CaretDownFilled, CaretLeftFilled, CaretUpFilled, CloseOutlined, CloseSquareOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import TableHeadNameWithSort from '../../components/template/TABLE/TableHeadNameWithSort';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';


import { ChevronLeftIcon, RectangleStackIcon } from '@heroicons/react/24/outline';

import BidListTable from './components/BidListTable';
import BidListSiderFilters from './components/BidListSiderFilters';
import { FILTERPRESETLIST } from '../ORG_LIST/components/mock/ORGLISTMOCK';
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import {BID_LIST} from "./mock/mock";
import {ANTD_PAGINATION_LOCALE} from "../../config/Localization";





const BidListPage = (props) => {
  const { userdata } = props;

  const [isLoading, setIsLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [baseCompanies, setBaseCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const { item_id } = useParams();
  const [openedFilters, setOpenedFilters] = useState(false);
  const [sortOrders, setSortOrders] = useState([]);

  const [bids, setBids] = useState([]);

  const [total, setTotal] = useState(0);
  const [onPage, setOnPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [filterBox, setFilterBox] = useState({});
  const [orderBox, setOrderBox] = useState({});

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const [filterPresetList, setFilterPresetList] = useState([]);

  const showGetItem = searchParams.get('show');


  const [isBackRoute, setIsBackRoute] = useState(false);
  const [fromOrgId, setFromOrgId] = useState(0);



  useEffect(() => {
    fetchInfo().then();
    if (showGetItem !== null){
      handlePreviewOpen(showGetItem);
      setTimeout(() => {
        
        setShowParam(showGetItem);
      }, 2200);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchBids().then(() => {
      setIsLoading(false);
    });
  }, [currentPage]);

  useEffect(() => {
    if (userdata !== null && userdata.companies && userdata.companies.length > 0) {
      setBaseCompanies(userdata.companies);
    }
  }, [userdata]);

  useEffect(() => {
    setCompanies(
      baseCompanies.map((item) => ({
        key: `kompa_${item.id}`,
        id: item.id,
        label: item.name,
      }))
    );
  }, [baseCompanies]);


  const fetchInfo = async () => {
    setIsLoading(true);
    await fetchFilterSelects();
    await fetchBids();
    setIsLoading(false);
  };

  const fetchFilterSelects = async () => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/offerfilters', {
          data: {},
          _token: CSRF_TOKEN
        });
        setFilterPresetList(response.data.offerfilters);
      } catch (e) {
        console.log(e);
      }
    } else {
      setFilterPresetList(FILTERPRESETLIST);
    }
  };

  const fetchBids = async () => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/offerlist', {
          data: {},
          _token: CSRF_TOKEN
        });
        setBids(response.data.bid_list);
        setTotal(response.data.total_count);
      } catch (e) {
        console.log(e);
      }
    } else {
      setBids(BID_LIST);
      setTotal(33000);
    }
  };

  const handleActivateSorter = (key, order) => {
    if (order === 0){
      setSortOrders([]);
    } else {
      setSortOrders([{key: key, order: order}]);
    }
  }


  const handleRowDblClick = (id) => {

  }

  const handlePreviewOpen = (item, state) => {
    console.log('HEllo', item);
    setShowParam(item);
    setPreviewItem(item);
    setIsPreviewOpen(true);
  }

    const setShowParam = (value) => {
      if (value !== null){
        searchParams.set('show', value);
        setSearchParams(searchParams);
      } else {
        searchParams.delete('show');
        setSearchParams(searchParams);
      }

  };

  useEffect(() => {
    if (!isPreviewOpen){
      setShowParam(null);
    }
  }, [isPreviewOpen]);

  return (
    <div className={`app-page sa-app-page ${openedFilters ? "sa-filer-opened":''}`}>
      <Affix>
        <div className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}>
          <div className={'sa-header-label-container'}>
            <h1 className={'sa-header-label'}>Список заявок</h1>
            <div className={'sa-vertical-flex'}>
              <Button.Group>
                <Button
                    onClick={() => {
                      setOpenedFilters(!openedFilters);
                    }}
                    color={'default'}
                    variant={'solid'}
                    icon={<FilterOutlined/>}
                >
                  Доп Фильтры
                </Button>
                <Button
                    title='Очистить фильтры'
                    color={'danger'}
                    variant={'solid'}
                    icon={<CloseOutlined/>}
                ></Button>
              </Button.Group>
              <Tag
                  style={{
                    width: '160px',
                    height: '32px',
                    lineHeight: '27px',
                    textAlign: 'center',
                    // color: '#868686',
                    fontSize: '14px',
                    /*backgroundColor: '#ededed',
                    borderColor: '#ededed',*/
                  }}
                  color="geekblue"
              >Всего найдено: {total}</Tag>
            </div>
          </div>
          <div>
            <CurrencyMonitorBar/>
          </div>
        </div>
      </Affix>

      <Layout className={'sa-layout sa-w-100'}>
        <Sider
            collapsed={!openedFilters}
            collapsedWidth={0}
            width={'300px'}
            style={{backgroundColor: '#ffffff'}}
        >
          <div className={'sa-sider'}>
            {openedFilters && (
                <BidListSiderFilters
                    filter_presets={filterPresetList}
                />

            )}
          </div>
        </Sider>


        <Content>
          <Affix offsetTop={100}>
            <div className={'sa-pagination-panel sa-pa-12 sa-back'}>
              <div className={'sa-flex-space'}>
                <div className={'sa-flex-gap'}>
                  {isBackRoute && (
                      <NavLink to={`/orgs?show=${fromOrgId}`}>
                        <Button type={'default'}
                            // icon={<ChevronLeftIcon height={'18px'} />}
                                icon={<CaretLeftFilled/>}
                        >
                        Назад в компанию
                        </Button>
                      </NavLink>
                  )}
                  <Pagination
                      defaultPageSize={onPage}
                      defaultCurrent={1}
                      current={currentPage}
                      total={total}
                      onChange={setCurrentPage}
                      // showSizeChanger
                      showQuickJumper
                      locale={ANTD_PAGINATION_LOCALE}
                  />
                </div>
                <div>

                </div>
                <div className={'sa-flex-gap'}>
                  <Tooltip title="Я временный куратор">
                    <Button color="default" variant={false ? "solid" : "filled"}
                        // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
                    >Временные</Button>
                  </Tooltip>
                  <Tooltip title="Компании с моим кураторством">
                    <Button color="default" variant={false ? "solid" : "filled"}
                        // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
                    >Мои</Button>
                  </Tooltip>
                  {/* <Button type={'primary'} icon={<PlusOutlined/>}>Добавить</Button> */}
                </div>
              </div>
            </div>
          </Affix>


          <div className={`${openedFilters ? "sa-pa-tb-12 sa-pa-s-3" : 'sa-pa-12'}`} style={{paddingTop: 0}}>

            <Spin spinning={isLoading}>
              <BidListTable
                  companies={companies}
                  bids={bids}
                  on_preview_open={handlePreviewOpen}
                  on_set_sort_orders={setOrderBox}
              />
            </Spin>

            {bids.length > 20 && (
                <div className={'sa-pagination-panel sa-pa-12'}>
                  <div className={'sa-flex-space'}>
                    <div className={'sa-flex-gap'}>
                      <Pagination
                          defaultPageSize={onPage}
                          defaultCurrent={1}
                          current={currentPage}
                          total={total}
                          onChange={setCurrentPage}
                          // showSizeChanger
                          showQuickJumper
                          locale={ANTD_PAGINATION_LOCALE}
                      />
                    </div>
                    <div>

                    </div>
                    <div>
                      {/* <Button type={'primary'} icon={<PlusOutlined/>}>Добавить</Button> */}
                    </div>
                  </div>
                </div>
            )}
            <div className={'sa-space-panel sa-pa-12'}></div>
          </div>
        </Content>

      </Layout>
      {/* <OrgListPreviewModal
            is_open={isPreviewOpen}
            data={previewItem}
            on_close={()=>{setIsPreviewOpen(false)}}
            /> */}
    </div>
  );
};

export default BidListPage;