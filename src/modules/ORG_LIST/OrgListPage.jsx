import React, { useEffect, useState } from 'react';

import './components/style/orglistpage.css';
import { CSRF_TOKEN, PRODMODE } from '../../config/config';
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import { Affix, Button, DatePicker, Dropdown, Input, Layout, Pagination, Select, Tooltip } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { DocumentPlusIcon } from '@heroicons/react/16/solid';
import { CaretDownFilled, CaretUpFilled, CloseOutlined, CloseSquareOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import TableHeadNameWithSort from '../../components/template/TABLE/TableHeadNameWithSort';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
import OrgListRow from './components/OrgListRow';
import OrgListPreviewModal from './components/OrgListPreviewModal';
import OrgListSiderFilter from './components/OrgListSiderFilters';
import OrgListTable from './components/OrgListTable';
import { RectangleStackIcon } from '@heroicons/react/24/outline';
import { FILTERPRESETLIST, OM_COMP_LIST } from './components/mock/ORGLISTMOCK';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';

const OrgListPage = (props) => {
  const { userdata } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  const [baseCompanies, setBaseCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);



  const [openedFilters, setOpenedFilters] = useState(false);
  const [sortOrders, setSortOrders] = useState([]);


  const [orgList, setOrgList] = useState([]);

  const [total, setTotal] = useState(0);
  const [onPage, setOnPage] = useState(50);
  const [currrentPage, setCurrentPage] = useState(1);


  const [filterBox, setFilterBox] = useState({});
  const [orderBox, setOrderBox] = useState({});


  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const [filterPresetList, setFilterPresetList] = useState(FILTERPRESETLIST);

  const showGetItem = searchParams.get('show');




  useEffect(() => {
    setShowLoader(true);
    if (PRODMODE) {
      // TODO: логика для PRODMODE
      get_orglist();

    } else {
      // TODO: логика для dev режима
      setOrgList(OM_COMP_LIST);
    };
    if (showGetItem !== null){
      handlePreviewOpen(showGetItem);
      setTimeout(() => {
        
        setShowParam(showGetItem);
      }, 2200);
    }
  }, []);



  useEffect(() => {
    if (userdata !== null && userdata.companies && userdata.companies.length > 0) {
      setBaseCompanies(userdata.companies);
    };
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
    if (PRODMODE){
      setShowLoader(true);
      get_orglist();
    }
  }, [currrentPage]);


  useEffect(() => {
    get_orglist();
  }, [filterBox, orderBox]);




  /** ------------------ FETCHES ---------------- */
    /**
     * Получение списка отделов
     * @param {*} req 
     * @param {*} res 
     */
    const get_orglist = async () => {
        if (PRODMODE) {
            try {
                let response = await PROD_AXIOS_INSTANCE.post('/api/sales/orglist', {
                  data: {
                    "profiles": null,
                    "name": filterBox.name,
                    "id": filterBox.id,
                    "curators": filterBox.curators,
                    "regions": filterBox.regions,
                    "price_statuses": null,
                    "rate_lists": null,
                    "towns": filterBox.towns,
                    "client_statuses": null,
                    "profsound": null,
                    "companies": null,
                    "contact_user": null,
                    "address": null,
                    "phone": null,
                    "email": null,
                    "site": null,
                    "created_date": [
                        null,
                        null
                    ],
                    "active_date": [
                        null,
                        null
                    ],
                    "page": currrentPage,
                    "limit": onPage,
                    "inn": filterBox.inn

                },
                  _token: CSRF_TOKEN
                });
                console.log('me: ', response);
                setOrgList(response.data.org_list);
                setTotal(response.data.total_count);
            } catch (e) {
                console.log(e)
            } finally {
                // setLoadingOrgs(false)
                setShowLoader(true);
            }
        } else {
            //setUserAct(USDA);
            setShowLoader(true);
        }
    }




  /** ------------------ FETCHES END ---------------- */








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


  /**
   * Здесь сливаются фильтры от сайдбара и от хедера таблицы
   * @param {*} filters 
   */
  const handleFilterChange = (filters) => {
    setFilterBox(prev => {
      const updated = { ...prev }; // копируем старые фильтры

      // Проходим по каждому полю в пришедших фильтрах
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        // Превращаем пустую строку, null, undefined → в null
        updated[key] = value === '' || value === null || value === undefined ? null : value;
      });

      return updated;
    });
  };

  return (
    <div className={`app-page ${openedFilters ? "sa-filer-opened":''}`}>
      <div className={'sa-control-panel sa-flex-space sa-pa-12'}>
        <div className={'sa-vertical-flex'}>
          <Button.Group>
            <Button
              onClick={() => {
                setOpenedFilters(!openedFilters);
              }}
              color={'default'}
              variant={'solid'}
              icon={<FilterOutlined />}
            >
              Доп Фильтры
            </Button>
            <Button
              title='Очистить фильтры'
              color={'danger'}
              variant={'solid'}
              icon={<CloseOutlined />}
              ></Button>
          </Button.Group>
          <Dropdown menu={{items: filterPresetList}}>
          <Button 
            icon={ <RectangleStackIcon width={'22px'}/>}
          >
           
          </Button>
          </Dropdown>
        </div>
        <div>
          {/* <Button color='default' variant='solid'>Solid</Button>
          <Button color='default' variant='outlined'>Outlined</Button>
          <Button color='default' variant='dashed'>Dashed</Button>
          <Button color='default' variant='filled'>Filled</Button>
          <Button color='default' variant='text'>Text</Button>
          <Button color='default' variant='link'>Link</Button> */}
          Организации
        </div>
        <div>
          <CurrencyMonitorBar />
        </div>
      </div>

      <Layout className={'sa-layout sa-w-100'}>
        <Sider
          collapsed={!openedFilters}
          collapsedWidth={0}
          width={'300px'}
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className={'sa-sider'}>
            {openedFilters && (
            <OrgListSiderFilter
              base_orgs={orgList}
              filter_presets={filterPresetList}
            />

            )}
          </div>
        </Sider>
        <Content>
          <div className={'sa-pagination-panel sa-pa-12'}></div>
          <div className={'sa-pagination-panel sa-pa-12'}>
            <div className={'sa-flex-space'}>
            <div className={'sa-flex-gap'}>
            <Pagination
              size={'small'}
              defaultCurrent={1}
              current={currrentPage}
              total={total}
              onChange={setCurrentPage}
              // showSizeChanger
              showQuickJumper
            />
            <Button disabled
              size={'small'}
            >Всего {total}</Button>
            </div>
            <div>

            </div>
            <div className={'sa-flex-gap'}>
              <Tooltip title="Я временный куратор">
                <Button color="default" variant={false ? "solid" : "filled"} size={'small'}
                    // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
                >Свободные</Button>
              </Tooltip>
              <Tooltip title="Я временный куратор">
              <Button color="default" variant={false ? "solid" : "filled"} size={'small'}
                  // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
              >Временные</Button>
              </Tooltip>
              <Tooltip title="Компании с моим кураторством">
              <Button color="default" variant={false ? "solid" : "filled"} size={'small'}
                  // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
              >Мои компании</Button>
              </Tooltip>
              {userdata?.user?.sales_role === 1 && (
                <Button type={'primary'} icon={<PlusOutlined/>}>Добавить</Button>
              )}
            </div>
            </div>
          </div>

          <div className={`${openedFilters ? "sa-pa-tb-12 sa-pa-s-3":'sa-pa-12'}`}>
          
          <OrgListTable 
              companies={companies}
              base_companies={baseCompanies}
              base_orgs={orgList}
              on_preview_open={handlePreviewOpen}
              on_set_sort_orders={setOrderBox}
              userdata={userdata}
              on_change_filters={handleFilterChange}
              base_filters={filterBox}
              base_orders={orderBox}
          />

          {/* {baseOrgs.length > 20 && (
            <div className={'sa-pagination-panel sa-pa-12'}>
              <div className={'sa-flex-space'}>
              <div className={'sa-flex-gap'}>
              <Pagination />
              <Button disabled>Всего {total}</Button>
              </div>
              <div>

              </div>
              <div>
                <Button type={'primary'} icon={<PlusOutlined/>}>Добавить</Button>
              </div>
              </div>
            </div>
          )} */}
          <div className={'sa-space-panel sa-pa-12'}>

          </div>
          </div>
        </Content>

      </Layout>
          <OrgListPreviewModal
            is_open={isPreviewOpen}
            data={previewItem}
            on_close={()=>{setIsPreviewOpen(false)}}
            />
    </div>
  );
};

export default OrgListPage;