import React, { useEffect, useState } from 'react';

import './components/style/orglistpage.css';
import { PRODMODE } from '../../config/config';
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
import { FILTERPRESETLIST } from './components/mock/ORGLISTMOCK';

const OrgListPage = (props) => {
  const { userdata } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  const [baseCompanies, setBaseCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const { item_id } = useParams();
  const [openedFilters, setOpenedFilters] = useState(false);
  const [sortOrders, setSortOrders] = useState([]);

  const [baseOrgs, setBaseOrgs] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
  const [total, setTotal] = useState(0);
  const [onPage, setOnPage] = useState(30);
  const [currrentPage, setCurrentPage] = useState(1);

  const [filterBox, setFilterBox] = useState({});
  const [orderBox, setOrderBox] = useState({});

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const [filterPresetList, setFilterPresetList] = useState(FILTERPRESETLIST);

  const showGetItem = searchParams.get('show');



  useEffect(() => {
    if (PRODMODE) {
      // TODO: логика для PRODMODE
    } else {
      // TODO: логика для dev режима
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
              base_orgs={baseOrgs}
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
            <Pagination />
            <Button disabled>Всего 6546</Button>
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
              >Мои компании</Button>
              </Tooltip>
              <Button type={'primary'} icon={<PlusOutlined/>}>Добавить</Button>
            </div>
            </div>
          </div>

          <div className={`${openedFilters ? "sa-pa-tb-12 sa-pa-s-3":'sa-pa-12'}`}>
          
          <OrgListTable 
              companies={companies}
              base_orgs={baseOrgs}
              on_preview_open={handlePreviewOpen}
              on_set_sort_orders={setOrderBox}
          />

          {baseOrgs.length > 20 && (
            <div className={'sa-pagination-panel sa-pa-12'}>
              <div className={'sa-flex-space'}>
              <div className={'sa-flex-gap'}>
              <Pagination />
              <Button disabled>Всего 6546</Button>
              </div>
              <div>

              </div>
              <div>
                <Button type={'primary'} icon={<PlusOutlined/>}>Добавить</Button>
              </div>
              </div>
            </div>
          )}
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