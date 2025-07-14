import React, { useEffect, useState } from 'react';

import './components/style/orglistpage.css';
import { PRODMODE } from '../../config/config';
import { NavLink, useParams } from 'react-router-dom';
import { Affix, Button, DatePicker, Input, Layout, Pagination, Select } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { DocumentPlusIcon } from '@heroicons/react/16/solid';
import { CaretDownFilled, CaretUpFilled, CloseOutlined, CloseSquareOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import TableHeadNameWithSort from '../../components/template/TABLE/TableHeadNameWithSort';
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar';
import OrgListRow from './components/OrgListRow';

const OrgListPage = (props) => {
  const { userdata } = props;
  const [baseCompanies, setBaseCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const { item_id } = useParams();
  const [openedFilters, setOpenedFilters] = useState(false);
  const [sortOrders, setSortOrders] = useState([]);

  const [baseOrgs, setBaseOrgs] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0]);



  useEffect(() => {
    if (PRODMODE) {
      // TODO: логика для PRODMODE
    } else {
      // TODO: логика для dev режима
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

  return (
    <div className={`app-page ${openedFilters ? "sa-filer-opened":''}`}>
      <div className={'sa-control-panel sa-flex-space sa-pa-12'}>
        <div className={'s'}>
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
        </div>
        <div>
          <Button color='default' variant='solid'>Solid</Button>
          <Button color='default' variant='outlined'>Outlined</Button>
          <Button color='default' variant='dashed'>Dashed</Button>
          <Button color='default' variant='filled'>Filled</Button>
          <Button color='default' variant='text'>Text</Button>
          <Button color='default' variant='link'>Link</Button>
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
          <div className={'sa-sider'}>Sider</div>
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
              <Button color="default" variant={false ? "solid" : "filled"}
                  // onClick={()=>{setShowOnlyCrew(false); setShowOnlyMine(!showOnlyMine)}}
              >Мои компании</Button>
              <Button type={'primary'} icon={<PlusOutlined/>}>Добавить</Button>
            </div>
            </div>
          </div>

          <div className={`${openedFilters ? "sa-pa-tb-12 sa-pa-s-3":'sa-pa-12'}`}>
          <div className={'sa-table-box'}>
          <Affix >
            <div className={'sa-table-box-header'}>
              <div className={'sa-table-box-orgs sa-table-box-row'}>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort 
                      sort_key={'id'}
                      on_double_click={handleActivateSorter}
                      active_sort_items={sortOrders}
                      >
                      id
                      </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Input type={'number'} size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort 
                      sort_key={'name'}
                      on_double_click={handleActivateSorter}
                      active_sort_items={sortOrders}
                      >Название организации
                      </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort 
                      sort_key={'town'}
                      on_double_click={handleActivateSorter}
                      active_sort_items={sortOrders}
                      >Город/регион
                      </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <DatePicker size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <TableHeadNameWithSort 
                      sort_key={'comment'}
                      on_double_click={handleActivateSorter}
                      active_sort_items={sortOrders}
                      >Комментарий
                      </TableHeadNameWithSort>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Статус $</div>
                    <div className={'sa-pa-3'}>
                      <Select size={'small'} style={{ width: '100%' }} variant='filled' options={companies} allowClear />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Баланс</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Профиль</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Куратор</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Свойства</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Действия</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Affix>

            <div className={'sa-table-box-stack'}>
              {baseOrgs.map((borg, index) => (
                <OrgListRow
                  key={index}
                 />
              ))}
            </div>
          </div>

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
    </div>
  );
};

export default OrgListPage;