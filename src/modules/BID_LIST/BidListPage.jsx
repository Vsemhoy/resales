import React, { useEffect, useState } from 'react';

import './components/style/bidlistpage.css';
import {CSRF_TOKEN, PRODMODE} from '../../config/config';
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import {Affix, Button, DatePicker, Dropdown, Input, Layout, Pagination, Select, Spin, Tag, Tooltip} from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { DocumentPlusIcon } from '@heroicons/react/16/solid';
import {
  CaretDownFilled,
  CaretLeftFilled,
  CaretUpFilled,
  CloseOutlined,
  CloseSquareOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import TableHeadNameWithSort from '../../components/template/TABLE/TableHeadNameWithSort';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';


import { ChevronLeftIcon, RectangleStackIcon } from '@heroicons/react/24/outline';

import BidListTable from './components/BidListTable';
import BidListSiderFilters from './components/BidListSiderFilters';
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import {BID_LIST, FILTERS} from "./mock/mock";
import {ANTD_PAGINATION_LOCALE} from "../../config/Localization";
import RemoteSearchSelect from "./components/RemoteSearchSelect";





const BidListPage = (props) => {
  const { userdata } = props;

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenedFilters, setIsOpenedFilters] = useState(false);
  const [isHasRole, setIsHasRole] = useState(false);
  const [isOneRole, setIsOneRole] = useState(true);
  const [isBackRoute, setIsBackRoute] = useState(false);

  const [fromOrgId, setFromOrgId] = useState(0);

  const [filterStep, setFilterStep] = useState([]);
  const [filterProtectionProject, setFilterProtectionProject] = useState([]);
  const [filterBidType, setFilterBidType] = useState([]);

  const [total, setTotal] = useState(0);
  const [onPage, setOnPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);

  const [bids, setBids] = useState([]);

  const [filterBox, setFilterBox] = useState({
      "company_name": null,
      "company_id": null,
      "object_name": null,
      "comment": null,
      "dates": null,
      "type": null,
      "manager": null,
      "bill_number": null,
      "protect_status": null,
      "pay_status": null,
      "stage_status": null,
      "bid_id": null
  });
  const [orderBox, setOrderBox] = useState({});

  const [sortOrders, setSortOrders] = useState([]);

  const [activeRole, setActiveRole] = useState(0);
  const [roles, setRoles] = useState([
    {
      value: 1,
      label: 'Менеджер',
      acl: 89
    },
    {
      value: 2,
      label: 'Администратор',
      acl: 90
    },
    {
      value: 3,
      label: 'Бухгалтер',
      acl: 91
    },
  ]);


  const [searchParams, setSearchParams] = useSearchParams();
  const [baseCompanies, setBaseCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const { item_id } = useParams();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const showGetItem = searchParams.get('show');


  useEffect(() => {
    fetchInfo().then();
    if (showGetItem !== null){
      handlePreviewOpen(showGetItem);
      setTimeout(() => {
        
        setShowParam(showGetItem);
      }, 2200);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setIsLoading(true);
      fetchBids().then(() => {
        setIsLoading(false);
      });
    }
  }, [currentPage, onPage, filterBox]);

  useEffect(() => {
    if (userdata !== null && userdata.companies && userdata.companies.length > 0) {
      setBaseCompanies(userdata.companies);
    }
    if (userdata !== null && userdata.acls) {
      // 89 - менеджер
      // 91 - администратор
      // 90 - бухгалтер
      const found = userdata.acls.filter(num => [89, 90, 91].includes(num));
      if (found) setIsHasRole(true);
      console.log('found', found.length);
      setIsOneRole(found.length === 1);
    }
    if (userdata !== null && userdata.user && userdata.user.sales_role) {
      setActiveRole(userdata.user.sales_role);
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
        let response = await PROD_AXIOS_INSTANCE.post('/api/sales/filterlist', {
          _token: CSRF_TOKEN
        });
        if (response.data) {
          const filters = response.data.content;
          setFilterStep(filters.step);
          setFilterProtectionProject(filters.protection_project);
          setFilterBidType(filters.type_select);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      setFilterStep(FILTERS.step);
      setFilterProtectionProject(FILTERS.protection_project);
      setFilterBidType(FILTERS.type_select);
    }
  };

  const fetchBids = async () => {
    if (PRODMODE) {
      const data = {
        "company_name": filterBox.company_name,
        "company_id": filterBox.company_id,
        "object_name": filterBox.object_name,
        "comment": filterBox.comment,
        "dates": filterBox.dates,
        "type": filterBox.type,
        "manager": filterBox.manager,
        "bill_number": filterBox.bill_number,
        "protect_status": filterBox.protect_status,
        "pay_status": filterBox.pay_status,
        "stage_status": filterBox.stage_status,
        "bid_id": filterBox.bid_id,
        "to": 0,
        "page": currentPage,
        "limit": onPage
      };
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/sales/data/offerlist', {
          data,
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

  const fetchSearchResults = async (searchText) => {
    if (PRODMODE) {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchText)}`);
        const data = await response.json();

        return data.items.map(item => ({
          label: item.name,
          value: item.id,
          ...item
        }));
      } catch (error) {
        console.error('Search error:', error);
        return [];
      }
    }
  };

  const fetchChangeRole = async (sales_role) => {
    if (PRODMODE) {
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/auth/me', {
          place: sales_role,
          _token: CSRF_TOKEN
        });
        console.log('response', response);
        if (response.data){
          if (props.changed_user_data){
            props.changed_user_data(response.data);
          }
        }
      } catch (e) {
        console.log(e)
      }
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
    console.log('HELLO', item);
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

  const prepareSelectOptions = (options) => {
    if (options && options.length > 0) {
      return options.map((option) => {
        return ({
          key: `option-${option.id}-${option.name}`,
          value: option.id,
          label: option.name,
          boss_id: option.boss_id,
          id_company: option.id_company,
          count: option.count,
          match: option.match,
        })
      });
    } else {
      return [];
    }
  };

  const handleUpdateFilterBox = (key, value) => {
    if (!filterBox) return 0;
    const fb = JSON.parse(JSON.stringify(filterBox))
    fb[key] = value;
    setFilterBox(fb);
    console.log(fb)
  };

  return (
    <div className={`app-page sa-app-page ${isOpenedFilters ? "sa-filer-opened":''}`}>
      <Affix>
        <div className={'sa-control-panel sa-flex-space sa-pa-12 sa-list-header'}>
          <div className={'sa-header-label-container'}>
            <div className={'sa-header-label-container-small'}>
              <h1 className={'sa-header-label'}>Список заявок</h1>
              <div>
                <CurrencyMonitorBar/>
              </div>
            </div>
            <div className={'sa-header-label-container-small'}>
              <div className={'sa-vertical-flex'}>
                <Button.Group>
                  <Button
                      onClick={() => {
                        setIsOpenedFilters(!isOpenedFilters);
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
                      fontSize: '14px',
                    }}
                    color="geekblue"
                >Всего найдено: {total}</Tag>
              </div>
              <div style={{display: 'flex', alignItems: 'end'}}>

                {activeRole > 0 && (
                    <div>
                      {isOneRole ? (
                          <div style={{display:'flex',alignItems:'center',gap:'5px',justifyContent:'end'}}>
                            Роль:
                            <Tag className={`
                                  sa-tag-custom
                                  ${activeRole === 1 ? 'sa-select-custom-manager' : ''}
                                  ${activeRole === 2 ? 'sa-select-custom-admin' : ''}
                                  ${activeRole === 3 ? 'sa-select-custom-bugh' : ''}
                                `}
                            >{roles.find(role => role.value === activeRole)?.label || 'Неизвестная роль'}</Tag>
                          </div>
                      ) : (
                          <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                            Роль:
                            <Select className={`
                                      ${activeRole === 1 ? 'sa-select-custom-manager' : ''}
                                      ${activeRole === 2 ? 'sa-select-custom-admin' : ''}
                                      ${activeRole === 3 ? 'sa-select-custom-bugh' : ''}
                                    `}
                                    style={{width:'150px',marginRight:'8px'}}
                                    options={roles.filter(role => userdata.acls.includes(role.acl))}
                                    value={activeRole}
                                    onChange={fetchChangeRole}
                            />
                          </div>
                      )}
                    </div>
                )}

                {/*<RemoteSearchSelect
                    placeholder="Поиск..."
                    fetchOptions={fetchSearchResults}
                    debounceTimeout={500}
                    allowClear
                    style={{ width: '250px', textAlign: 'left' }}
                    onSelect={(value, option) => {
                      console.log('Selected:', value, option);
                    }}
                />*/}
              </div>
            </div>
          </div>
        </div>
      </Affix>

      <Layout className={'sa-layout sa-w-100'}>
        <Sider
            collapsed={!isOpenedFilters}
            collapsedWidth={0}
            width={'300px'}
            style={{backgroundColor: '#ffffff'}}
        >
          <div className={'sa-sider'}>
            {isOpenedFilters && (
                <BidListSiderFilters

                />
            )}
          </div>
        </Sider>


        <Content>
          <Affix offsetTop={106}>
            <div className={'sa-pagination-panel sa-pa-12-24 sa-back'}>
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
          </Affix>


          <div className={`${isOpenedFilters ? "sa-pa-tb-12 sa-pa-s-3" : 'sa-pa-12'}`} style={{paddingTop: 0}}>

            <Spin spinning={isLoading}>
              <BidListTable
                  companies={companies}
                  bids={bids}

                  filter_steps={prepareSelectOptions(filterStep)}
                  filter_protection_projects={prepareSelectOptions(filterProtectionProject)}
                  filter_bid_types={prepareSelectOptions(filterBidType)}

                  on_change_filter_box={handleUpdateFilterBox}

                  on_preview_open={handlePreviewOpen}
                  on_set_sort_orders={setOrderBox}
              />
            </Spin>

            {/*{bids.length > 20 && (
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
                       <Button type={'primary'} icon={<PlusOutlined/>}>Добавить</Button>
                    </div>
                  </div>
                </div>
            )}*/}
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