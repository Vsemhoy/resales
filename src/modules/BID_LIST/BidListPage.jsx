import React, { useEffect, useState } from 'react';

import './components/style/bidlistpage.css';
import {CSRF_TOKEN, PRODMODE} from '../../config/config';
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import {Affix, Button, Dropdown, Layout, Pagination, Select, Spin, Tag, Tooltip} from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import {
  CaretLeftFilled,
  CloseOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
import BidListTable from './components/BidListTable';
import BidListSiderFilters from './components/BidListSiderFilters';
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import {BID_LIST, FILTERS} from "./mock/mock";
import {ANTD_PAGINATION_LOCALE} from "../../config/Localization";
import {updateURL} from "../../components/helpers/UriHelpers";


const BidListPage = (props) => {
  const { userdata } = props;

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenedFilters, setIsOpenedFilters] = useState(false);
  const [isHasRole, setIsHasRole] = useState(false);
  const [isOneRole, setIsOneRole] = useState(true);
  const [isBackRoute, setIsBackRoute] = useState(false);

  const [fromOrgId, setFromOrgId] = useState(0);

  /* в шапке таблицы */
  const [filterStep, setFilterStep] = useState([]);
  const [filterProtectionProject, setFilterProtectionProject] = useState([]);
  const [filterBidType, setFilterBidType] = useState([]);
  /* в фильтрах sider */
  const [filterPaySelect, setFilterPaySelect] = useState([]);
  const [filterAdminAcceptSelect, setFilterAdminAcceptSelect] = useState([]);
  const [filterPackageSelect, setFilterPackageSelect] = useState([]);
  const [filterPriceSelect, setFilterPriceSelect] = useState([]);
  const [filterBidCurrencySelect, setFilterBidCurrencySelect] = useState([]);
  const [filterNdsSelect, setFilterNdsSelect] = useState([]);
  const [filterCompleteSelect, setFilterCompleteSelect] = useState([]);
  const [filterManagersSelect, setFilterManagersSelect] = useState([]);
  const [filterCompaniesSelect, setFilterCompaniesSelect] = useState([]);

  const [filterSortClearMenu, setFilterSortClearMenu] = useState([]);

  const [total, setTotal] = useState(0);
  const [onPage, setOnPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);

  const [bids, setBids] = useState([]);

  const [myBids, setMyBids] = useState(false);

  const initialFilterBox = {
    "bid_id": null,
    "company_name": null,
    "type": null,
    "protect_status": null,
    "stage_status": null,
    "dates": null,
    "manager": null,
    "bill_number": null,
    "comment": null,
    "object_name": null,

    "target_company": null,
    "pay_status": null,
    "admin_accept": null,
    "package": null,
    "price": null,
    "bid_currency": null,
    "nds": null,
    "complete": null,
  };
  const [filterBox, setFilterBox] = useState(initialFilterBox);
  const [orderBox, setOrderBox] = useState({});

  const [sortOrders, setSortOrders] = useState([]);

  const [userInfo, setUserInfo] = useState(null);
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
      const timer = setTimeout(() => {
        setIsLoading(true);
        fetchBids().then(() => {
          setIsLoading(false);
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [currentPage, onPage, filterBox, orderBox]);

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
      setUserInfo(userdata.user);
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

  useEffect(() => {
    if (!isPreviewOpen){
      setShowParam(null);
    }
  }, [isPreviewOpen]);

  useEffect(() => {
    makeFilterMenu();
  }, [filterBox, orderBox]);

  useEffect(() => {
    if (filterBox.manager && +filterBox.manager === +userInfo.id) {
      setMyBids(true);
    } else {
      setTimeout(() => {
        setMyBids(false);
      }, 500);
    }
  }, [filterBox]);

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
          setFilterPaySelect(filters.pay_select);
          setFilterAdminAcceptSelect(filters.admin_accept_select);
          setFilterPackageSelect(filters.package_select);
          setFilterPriceSelect(filters.price_select);
          setFilterBidCurrencySelect(filters.bid_currency_select);
          setFilterNdsSelect(filters.nds_select);
          setFilterCompleteSelect(filters.complete_select);
          setFilterManagersSelect(filters.managers);
          setFilterCompaniesSelect(filters.companies);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      setFilterStep(FILTERS.step);
      setFilterProtectionProject(FILTERS.protection_project);
      setFilterBidType(FILTERS.type_select);
      setFilterPaySelect(FILTERS.pay_select);
      setFilterAdminAcceptSelect(FILTERS.admin_accept_select);
      setFilterPackageSelect(FILTERS.package_select);
      setFilterPriceSelect(FILTERS.price_select);
      setFilterBidCurrencySelect(FILTERS.bid_currency_select);
      setFilterNdsSelect(FILTERS.nds_select);
      setFilterCompleteSelect(FILTERS.complete_select);
      setFilterManagersSelect(FILTERS.managers_select);
      setFilterCompaniesSelect(FILTERS.companies);
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
        "stage_status": filterBox.stage_status,
        "bid_id": filterBox.bid_id,

        "target_company": filterBox.target_company,
        "pay_status": filterBox.pay_status,
        "admin_accept": filterBox.admin_accept,
        "package": filterBox.package,
        "price": filterBox.price,
        "bid_currency": filterBox.bid_currency,
        "nds": filterBox.nds,
        "complete_status": filterBox.complete,

        "to": 0,
        "page": currentPage,
        "limit": onPage,
        "sort_orders": orderBox,
      }
      try {
        let response = await PROD_AXIOS_INSTANCE.post('/sales/data/offerlist', {
          data,
          _token: CSRF_TOKEN
        });
        setBids(response.data.bid_list);
        setTotal(response.data.total_count);

        let max = (onPage * currentPage) - (onPage - 1);
        if (response.data.total_count < max)
        {
          setCurrentPage(1);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      setBids(BID_LIST);
      setTotal(33000);
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
  };

  const handleRowDblClick = (id) => {

  };

  const handlePreviewOpen = (item, state) => {
    console.log('HELLO', item);
    setShowParam(item);
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const setShowParam = (value) => {
    if (value !== null){
      searchParams.set('show', value);
      setSearchParams(searchParams);
    } else {
      searchParams.delete('show');
      setSearchParams(searchParams);
    }
  };

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

  const handleUpdateFilterBoxHeader = (newFilterBox) => {
    const filterBoxUpd = JSON.parse(JSON.stringify(filterBox));

    if (filterBox.bid_id !== newFilterBox.bid_id) {
      filterBoxUpd.bid_id = newFilterBox.bid_id;
    }
    if (filterBox.company_name !== newFilterBox.company_name) {
      filterBoxUpd.company_name = newFilterBox.company_name;
    }
    if (filterBox.type !== newFilterBox.type) {
      filterBoxUpd.type = newFilterBox.type;
    }
    if (filterBox.protect_status !== newFilterBox.protect_status) {
      filterBoxUpd.protect_status = newFilterBox.protect_status;
    }
    if (filterBox.stage_status !== newFilterBox.stage_status) {
      filterBoxUpd.stage_status = newFilterBox.stage_status;
    }
    if (filterBox.dates !== newFilterBox.dates) {
      filterBoxUpd.dates = newFilterBox.dates;
    }
    if (filterBox.manager !== newFilterBox.manager) {
      filterBoxUpd.manager = newFilterBox.manager;
    }
    if (filterBox.bill_number !== newFilterBox.bill_number) {
      filterBoxUpd.bill_number = newFilterBox.bill_number;
    }
    if (filterBox.comment !== newFilterBox.comment) {
      filterBoxUpd.comment = newFilterBox.comment;
    }
    if (filterBox.object_name !== newFilterBox.object_name) {
      filterBoxUpd.object_name = newFilterBox.object_name;
    }

    setFilterBox(filterBoxUpd);
  };
  const handleUpdateFilterBoxSider = (newFilterBox) => {
    const filterBoxUpd = JSON.parse(JSON.stringify(filterBox));

    if (filterBox.target_company !== newFilterBox.target_company) {
      filterBoxUpd.target_company = newFilterBox.target_company;
    }
    if (filterBox.pay_status !== newFilterBox.pay_status) {
      filterBoxUpd.pay_status = newFilterBox.pay_status;
    }
    if (filterBox.admin_accept !== newFilterBox.admin_accept) {
      filterBoxUpd.admin_accept = newFilterBox.admin_accept;
    }
    if (filterBox.package !== newFilterBox.package) {
      filterBoxUpd.package = newFilterBox.package;
    }
    if (filterBox.price !== newFilterBox.price) {
      filterBoxUpd.price = newFilterBox.price;
    }
    if (filterBox.bid_currency !== newFilterBox.bid_currency) {
      filterBoxUpd.bid_currency = newFilterBox.bid_currency;
    }
    if (filterBox.nds !== newFilterBox.nds) {
      filterBoxUpd.nds = newFilterBox.nds;
    }
    if (filterBox.complete !== newFilterBox.complete) {
      filterBoxUpd.complete = newFilterBox.complete;
    }
    setFilterBox(filterBoxUpd);
  };
  const makeFilterMenu = () => {
    let clearItems = [];
    let hasFilter = false;
    let hasSorter = false;

    for (const key in filterBox) {
      const fib = filterBox[key];
      if (fib !== null){
        if (key === "updated_date" && fib[0] !== null){
          hasFilter = true;
        } else if (key === "created_date" && fib[0] !== null){
          hasFilter = true;
        } else if (key !== "updated_date" && key !== "created_date" && key !== "page" && key !== "onpage" && key !== 'limit')
          hasFilter = true;
      }
    }
    for (const key in orderBox) {
      const fib = orderBox[key];
      if (fib !== null){
        hasSorter = true;
      }
    }

    if (hasFilter){
      clearItems.push({
        key: 'clarboxofilta',
        value: 'clear_filters',
        label: <div onClick={handleClearAllFilterBox}>Очистить фильтры</div>
      })
    }

    if (hasSorter){
      clearItems.push({
        key: 'clarboxsorta',
        value: 'clear_filters',
        label: <div onClick={handleClearOrderBox}>Очистить cортировки</div>
      })
    }
    setFilterSortClearMenu(clearItems);
  };

  const handleClearAllFilterBox = ()=> {
    setFilterBox({});
  };

  const handleClearOrderBox = ()=> {
    setOrderBox({});
  };

  const handleClearAllBoxes = ()=> {
    setFilterBox(initialFilterBox);
    setOrderBox({});
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
                      className={`${isOpenedFilters ? 'sa-default-solid-btn-color' : 'sa-default-outlined-btn-color'}`}
                      color={'default'}
                      variant={isOpenedFilters ? 'solid' : 'outlined'}
                      icon={<FilterOutlined/>}
                  >
                    Доп Фильтры
                  </Button>
                  {filterSortClearMenu.length > 0 && (
                      <Tooltip title={'Очистить фильтры'}  placement={'right'}>
                        <Dropdown menu={{items: filterSortClearMenu}}>
                          <Button
                              color={'danger'}
                              variant={'solid'}
                              icon={<CloseOutlined />}
                              onClick={handleClearAllBoxes}
                          >
                          </Button>
                        </Dropdown>
                      </Tooltip>

                  )}
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
            style={{backgroundColor: '#ffffff',  overflow: 'hidden'}}
        >
          <div className={'sa-sider'}>
            {isOpenedFilters && (
                <BidListSiderFilters
                  filter_pay_select={prepareSelectOptions(filterPaySelect)}
                  filter_admin_accept_select={prepareSelectOptions(filterAdminAcceptSelect)}
                  filter_package_select={prepareSelectOptions(filterPackageSelect)}
                  filter_price_select={prepareSelectOptions(filterPriceSelect)}
                  filter_bid_currency_select={prepareSelectOptions(filterBidCurrencySelect)}
                  filter_nds_select={prepareSelectOptions(filterNdsSelect)}
                  filter_complete_select={prepareSelectOptions(filterCompleteSelect)}
                  filter_companies_select={prepareSelectOptions(filterCompaniesSelect)}
                  filter_box={filterBox}
                  on_change_filter_box={handleUpdateFilterBoxSider}
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
                      showQuickJumper
                      locale={ANTD_PAGINATION_LOCALE}
                  />
                </div>
                <div>

                </div>
                <div className={'sa-flex-gap'}>
                  {/*<Tooltip placement="bottom" title="Я временный куратор">
                    <Button color="default" variant={false ? "solid" : "filled"}
                        // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
                    >Временные</Button>
                  </Tooltip>*/}
                  <Tooltip placement="bottom" title="Заявки созданные Вами">
                    <Button color="default" variant={myBids ? "solid" : "filled"}
                            onClick={()=>{setMyBids(!myBids)}}
                    >Мои заявки</Button>
                  </Tooltip>
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
                  filter_managers={prepareSelectOptions(filterManagersSelect)}
                  user_info={userInfo}
                  my_bids={myBids}
                  filter_box={filterBox}
                  on_change_filter_box={handleUpdateFilterBoxHeader}
                  on_preview_open={handlePreviewOpen}
                  on_set_sort_orders={setOrderBox}
                  base_companies={baseCompanies}
              />
            </Spin>
            <div className={'sa-space-panel sa-pa-12'}></div>
          </div>
        </Content>

      </Layout>
    </div>
  );
};

export default BidListPage;