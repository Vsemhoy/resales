import React, { useEffect, useState } from 'react';

import './components/style/bidlistpage.css';
import { PRODMODE } from '../../config/config';
import { useParams } from 'react-router-dom';
import { Button, DatePicker, Input, Layout, Pagination, Select } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';

const BidListPage = (props) => {
  const { userdata } = props;
  const [baseCompanies, setBaseCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const { item_id } = useParams();
  const [openedFilters, setOpenedFilters] = useState(false);
  const [baseOrgs, setBaseOrgs] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);

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

  return (
    <div className='app-page'>
      <div className={'sa-control-panel sa-flex-space sa-pa-12'}>
        <div>
          <Button
            onClick={() => {
              setOpenedFilters(!openedFilters);
            }}
            color={'default'}
            variant={'solid'}
          >
            Open filter
          </Button>
        </div>
        <div>
          <Button color='default' variant='solid'>Solid</Button>
          <Button color='default' variant='outlined'>Outlined</Button>
          <Button color='default' variant='dashed'>Dashed</Button>
          <Button color='default' variant='filled'>Filled</Button>
          <Button color='default' variant='text'>Text</Button>
          <Button color='default' variant='link'>Link</Button>
        </div>
        <div></div>
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
          <div className={'sa-pagination-panel sa-pa-12'}>
            <Pagination />
          </div>
          <div className={'sa-pagination-panel sa-pa-12'}></div>
          <div className={'sa-table-box sa-pa-12'}>
            <div className={'sa-table-box-header'}>
              <div className={'sa-table-box-stm sa-table-box-row'}>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>org id</div>
                    <div className={'sa-pa-3'}>
                      <Input type={'number'} size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Название первое-второе</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>Дата отвязки</div>
                    <div className={'sa-pa-3'}>
                      <DatePicker size={'small'} style={{ width: '100%' }} variant='filled' />
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
                    <div className={'sa-pa-3'}>Компания</div>
                    <div className={'sa-pa-3'}>
                      <Select size={'small'} style={{ width: '100%' }} variant='filled' options={companies} allowClear />
                    </div>
                  </div>
                </div>
                <div className={'sa-table-box-cell'}>
                  <div className={'sa-table-head-on'}>
                    <div className={'sa-pa-3'}>1</div>
                    <div className={'sa-pa-3'}>
                      <Input size={'small'} style={{ width: '100%' }} variant='filled' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={'sa-table-box-stack'}>
              {baseOrgs.map((borg, index) => (
                <div className={'sa-table-box-stm sa-table-box-row'} key={index}>
                  <div className={'sa-table-box-cell'}>
                    <div>org id</div>
                  </div>
                  <div className={'sa-table-box-cell'}>
                    <div>Название / второе название</div>
                  </div>
                  <div className={'sa-table-box-cell'}>
                    <div>Дата отвязки</div>
                  </div>
                  <div className={'sa-table-box-cell'}>
                    <div>Компания</div>
                  </div>
                  <div className={'sa-table-box-cell'}>
                    <div>1</div>
                  </div>
                  <div className={'sa-table-box-cell'}>
                    <div>1</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default BidListPage;