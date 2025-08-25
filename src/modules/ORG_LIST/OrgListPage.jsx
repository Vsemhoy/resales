import React, { useEffect, useState } from 'react';

import './components/style/orglistpage.css';
import { CSRF_TOKEN, PRODMODE } from '../../config/config';
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import { Affix, Button, DatePicker, Dropdown, Input, Layout, Pagination, Select, Spin, Tooltip } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { DocumentPlusIcon } from '@heroicons/react/16/solid';
import { CaretDownFilled, CaretUpFilled, CloseOutlined, CloseSquareOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import TableHeadNameWithSort from '../../components/template/TABLE/TableHeadNameWithSort';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
import OrgListRow from './components/OrgListRow';
import OrgListPreviewModal from './components/OrgModal/OrgListPreviewModal';
import OrgListSiderFilter from './components/OrgListSiderFilters';
import OrgListTable from './components/OrgListTable';
import { RectangleStackIcon } from '@heroicons/react/24/outline';
import { FILTERPRESETLIST, OM_COMP_LIST, OM_ORG_FILTERDATA } from './components/mock/ORGLISTMOCK';
import { PROD_AXIOS_INSTANCE } from '../../config/Api';
import { ANTD_PAGINATION_LOCALE } from '../../config/Localization';
import { readOrgURL, updateURL } from '../../components/helpers/UriHelpers';



const OrgListPage = (props) => {
  const { userdata } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  const [baseCompanies, setBaseCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [baseFiltersData, setBaseFilterstData] = useState(null); 

  const [openedFilters, setOpenedFilters] = useState(false);
  const [sortOrders, setSortOrders] = useState({});


  const [orgList, setOrgList] = useState([]);

  const [total, setTotal] = useState(0);
  const [onPage, setOnPage] = useState(50);
  const [currrentPage, setCurrentPage] = useState(1);
  const [previousPage, setPreviousPage] = useState(1);


  const [filterBox, setFilterBox] = useState({});
  const [orderBox, setOrderBox] = useState({});
  const [initFilterBox, setInitFilterBox] = useState({});
  /** Сортировки как объект, где колонка - ключ, значение - ASC/DESC */

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  // Пресеты - преднастроенные фильтры
  const [filterPresetList, setFilterPresetList] = useState(FILTERPRESETLIST);

  const showGetItem = searchParams.get('show');
  const [targetRowId, setTargetRowId] = useState(searchParams.get('target'));

  // Список кураторов меняется в зависимости от выбранной компании
  const [selectCuratorList, setSelectCuratorList] = useState([]);


  useEffect(() => {
    setShowLoader(true);
      // При загрузке — читаем URL
      const { _filters, _sorts, _page, _onPage } = readOrgURL();

      // Устанавливаем стейт фильтров, сортировок, страницы
      setFilterBox(prev => ({ ...prev, ..._filters }));
      setInitFilterBox(_filters);
      setOrderBox(_sorts);
      setCurrentPage(_page);
      setOnPage(_onPage);

      // console.clear();

    if (PRODMODE) {
      // TODO: логика для PRODMODE
      get_org_filters();
      // get_orglist();

    } else {
      // TODO: логика для dev режима
      setBaseFilterstData(OM_ORG_FILTERDATA);
      setOrgList(OM_COMP_LIST);
    };
    if (showGetItem !== null){
      handlePreviewOpen(showGetItem);
      setTimeout(() => {
        
        setShowParam(showGetItem);

        
      }, 2200);
    }
    setTimeout(() => {
      if (targetRowId){
          console.log('targetRowId', targetRowId)
          let drow = document.querySelector('#orgrow_' + targetRowId);
          if (drow){
            drow.scrollIntoView( {behavior: "auto", block: "center", inline: "start"})
          }
        }
    }, 100);
  }, []);



   useEffect(() => {
        const timer = setTimeout(() => {
            updateURL(filterBox, orderBox, currrentPage, onPage);
        }, 1500);
    
        // Очищаем таймер, если эффект пересоздаётся (чтобы не было утечек)
        return () => clearTimeout(timer);
  }, [filterBox, orderBox, onPage, currrentPage]);



  useEffect(() => {
    console.log("baseFiltersData",baseFiltersData);
  }, [baseFiltersData]);


  /** Перелистывание страниц стрелками + CTRL */
  useEffect(() => {
    const handleKeyDown = (ev) => {
      if (!ev.ctrlKey) return; // игнорировать если Ctrl не нажат

      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        ev.preventDefault();

        if (total / onPage <= 1) return;

        // const currentIndex = orgs.findIndex(item => item.id === selectedItem);
        // if (currentIndex === -1) return;

        let newIndex = currrentPage;
        const maxPage = Math.ceil(total / onPage);

        if (ev.key === 'ArrowRight' && currrentPage < Math.ceil(total / onPage)) {
          newIndex = currrentPage + 1;
        } else if (ev.key === 'ArrowLeft' && currrentPage > 1) {
          newIndex = currrentPage - 1;
        }

        
        if (newIndex !== currrentPage) {
          setCurrentPage(newIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPage, currrentPage, orgList, total]);


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
        value: item.id,
        label: item.id === 1 ? "Free company" : item.name,
      }))
    );
  }, [baseCompanies]);


  useEffect(() => {
    if (baseFiltersData && baseFiltersData.curators)
    {

        let asetCurators = [];
        if (!filterBox || !filterBox.companies || filterBox.companies === null){
          asetCurators = baseFiltersData.curators.map((item)=>({
            key: 'curacu_' + item.id,
            label: item.fullname,
            value: item.id
          }));
        } else {
          asetCurators = baseFiltersData.curators.filter((item)=>item.id_company === filterBox.companies)
            .map((item)=>({
              key: 'curacu_' + item.id,
              label: item.fullname,
              value: item.id
            }));
        }
        setSelectCuratorList(asetCurators);
      }
  }, [filterBox, baseFiltersData]);


  useEffect(() => {
    get_orglist();
  }, [filterBox, orderBox]);


  /** При смене страницы, если открыт модал, меняем ИД открытой компании */
  useEffect(() => {
    let prevPage = previousPage;
    if (previewItem !== null && prevPage !== currrentPage){

      if (prevPage > currrentPage){
        // Move page back
        let newId = orgList[orgList.length - 1]?.id;
        if (newId){
          setPreviewItem(newId);
        } else {
          setPreviewItem(null);
          setIsPreviewOpen(false);
        }

      } else {
        // move page forward
        let newId = orgList[0]?.id;
        setPreviewItem(newId);
      }
      setPreviousPage(currrentPage);
    }
  }, [orgList]);




  /** ------------------ FETCHES ---------------- */
    /**
     * Получение списка клиентов-компаний
     * @param {*} req 
     * @param {*} res 
     */
    const get_orglist = async () => {
        if (PRODMODE) {
          setShowLoader(true);
          console.log('filterBox', filterBox, orderBox)
          let sortBox = orderBox && orderBox.length > 0 ? orderBox.map((item)=>({
            field: item.key,
            order: item.order === 2 ? 'DESC' : 'ASC'
          })) : [];

          // let sortBox = [];

            try {
                let response = await PROD_AXIOS_INSTANCE.post('/api/sales/orglist', {
                  data: {
                    "sort_orders": sortBox,
                    "profiles": filterBox.profiles,
                    "name": filterBox.name,
                    "id": filterBox.id,
                    "curators": filterBox.curator,
                    "regions": filterBox.regions,
                    "price_statuses": filterBox.price_statuses,
                    "rate_lists": filterBox.rate_lists,
                    "towns": filterBox.towns,
                    "client_statuses": filterBox.client_statuses,
                    "profsound": filterBox.profsound,
                    "companies": filterBox.companies,
                    "contact_user":  filterBox.contact_user,
                    "address": filterBox.address,
                    "phone": filterBox.phone,
                    "email": filterBox.email,
                    "site": filterBox.site,
                    "created_date": [
                        filterBox.created_date && filterBox.created_date[0] ? filterBox.created_date[0].unix() : null,
                        filterBox.created_date && filterBox.created_date[1] ? filterBox.created_date[1].unix() : null,
                    ],
                    "active_date": [
                        filterBox.updated_date && filterBox.updated_date[0] ? filterBox.updated_date[0].unix() : null,
                        filterBox.updated_date && filterBox.updated_date[1] ? filterBox.updated_date[1].unix() : null,
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
                setShowLoader(false);
            }
        } else {
            //setUserAct(USDA);
            setShowLoader(false);
        }
    }


     /**
     * Получение списка select data
     * @param {*} req 
     * @param {*} res 
     */
    const get_org_filters = async () => {
        if (PRODMODE) {
            try {
                let response = await PROD_AXIOS_INSTANCE.post('api/sales/orgfilterlist', {
                  data: {},
                  _token: CSRF_TOKEN
                });
                console.log('me2: ', response);
                setBaseFilterstData(response.data.filters);

            } catch (e) {
                console.log(e)
            } finally {
                // setLoadingOrgs(false)
                
            }
        } else {
            //setUserAct(USDA);
            
        }
    }


  /** ------------------ FETCHES END ---------------- */








  const handleActivateSorter = (key, order) => {
    if (order === 0){
      setOrderBox([]);
    } else {
      setOrderBox([{key: key, order: order}]);
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
    setShowLoader(true);
  };

  const triggerMyCompaniesFilterButton = () => {
    let value = filterBox.curator;
    let newValue = null;
    if (!value){
      newValue = userdata.user?.id;
    };
    setFilterBox(prev => {
      const updated = { ...prev }; // копируем старые фильтры
        updated.curator = newValue;
        return updated;
      });
  }

  const triggerFreeCompaniesFilterButton = () => {
    let value = filterBox.companies;
    let newValue = null;
    if (!value){
      newValue = 1;
    };
    setFilterBox(prev => {
      const updated = { ...prev }; // копируем старые фильтры
        updated.companies = newValue;
        return updated;
      });
  };

  const handleSelectedItemChange = (item_id) => {
    console.log('item', item_id);
    if (item_id){
      setPreviewItem(item_id);
    }
  }

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
              companies={companies}
              on_change_filters={handleFilterChange}
              base_filters={baseFiltersData}
              filters_data={filterBox}
              init_filters={initFilterBox}
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
              defaultPageSize={onPage}
              size={'small'}
              defaultCurrent={1}
              current={currrentPage}
              total={total}
              onChange={setCurrentPage}
              // showSizeChanger
              showQuickJumper
              locale={ANTD_PAGINATION_LOCALE}
            />
            <Button disabled
              size={'small'}
            >Всего {total}</Button>
            </div>
            <div>

            </div>
            <div className={'sa-flex-gap'}>
              <Tooltip title="Я временный куратор">
                <Button 
                color={'default'}
                variant={filterBox?.companies === 1 ? "solid" : "filled"}
                size={'small'}
                    // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
                    onClick={triggerFreeCompaniesFilterButton}
                >Свободные</Button>
              </Tooltip>
              <Tooltip title="Я временный куратор">
              <Button color="default" variant={false ? "solid" : "filled"} size={'small'}
                  // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
              >Временные</Button>
              </Tooltip>
              <Tooltip title="Компании с моим кураторством">
              <Button
                color={'default'}
                variant={filterBox?.curator === userdata?.user?.id ? "solid" : "filled"}
                size={'small'}
                onClick={triggerMyCompaniesFilterButton}
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
          
          <Spin spinning={showLoader} delay={500}>
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
              curator_list={selectCuratorList}
              selected_item={previewItem}
              on_select_change={handleSelectedItemChange}
          /></Spin>

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
            data={{id: previewItem, name: orgList.find((item) => item.id === previewItem)?.name}}
            on_close={()=>{
              setIsPreviewOpen(false);
              setPreviewItem(null);
            }}
            selects_data={baseFiltersData}
            />
    </div>
  );
};

export default OrgListPage;