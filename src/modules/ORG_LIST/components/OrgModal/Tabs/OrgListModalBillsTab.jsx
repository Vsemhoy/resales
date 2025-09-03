import { Button, Pagination, Spin, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import OrgBidTabRow from './TabComponents/OrgBidTabRow';
import { CSRF_TOKEN, PRODMODE } from '../../../../../config/config';
import { OM_ORG_BIDS } from '../../mock/ORGLISTMOCK';
import { NavLink } from 'react-router-dom';
import { PROD_AXIOS_INSTANCE } from '../../../../../config/Api';
import OrgBillModalRow from './TabComponents/RowTemplates/OrgBillModalRow';
import { ANTD_PAGINATION_LOCALE } from '../../../../../config/Localization';
import { MODAL_BILLS_LIST } from '../../mock/MODALBILLSTABMOCK';


const OrgListModalBillsTab = (props) => {
  const [baseBids, setBaseBids] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [onPage, setOnPage] = useState(30);
  const [showLoader, setShowLoader] = useState(false);
  const [total, setTotal] = useState(1);
  const [orgName, setOrgName] = useState(null);

  const [orgId, setOrgId] = useState(null);
  const [baseOrgData, setBaseOrgData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    if (props.data?.id){
      setOrgId(props.data.id);

      if (PRODMODE){
        if (props.data?.id !== orgId){
          setCurrentPage(1);
          setLoading(true);
          get_org_data_action(props.data.id, 1, onPage);
        }
      } else {
        setBaseOrgData(MODAL_BILLS_LIST);
      }

    } else {
      setOrgId(null);
      setBaseOrgData(null);
    }
  }, [props.data]);


  useEffect(() => {
    setOrgName(props.org_name);
  }, [props.org_name]);

    useEffect(() => {
      if (baseOrgData?.bids !== null && baseOrgData?.bids?.length > 0){
        setDataList(baseOrgData.bids);
      } else {
        setDataList([]);
      }
      setLoading(false);
    }, [baseOrgData]);



  /** ----------------------- FETCHES -------------------- */

  const get_org_data_action = async (id, cpage, onpage) => {

  
      try {
          let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/b', {
            data: {
              page: cpage,
              limit: onpage,
              type: 2,
            },
            _token: CSRF_TOKEN
          });
          console.log('response', response);
          if (response.data){
              // if (props.changed_user_data){
              //     props.changed_user_data(response.data);
              // }
              setBaseOrgData(response.data.content);
              setLoading(false);
              setTotal(response.data.total);
          }
      } catch (e) {
          console.log(e)
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }

  }


  /** ----------------------- FETCHES -------------------- */



  

  

  
  return (
    <Spin spinning={loading}>
    <div className={'sa-orgtab-container'}>
        <div className={'sa-pa-6 sa-flex-space'}>
          <div className='sa-flex-space'>
            <Pagination 
              size={'small'}
              current={currentPage}
              pageSizeOptions={[10, 30, 50, 100]}
              defaultPageSize={onPage}
              locale={ANTD_PAGINATION_LOCALE}
              showQuickJumper
              total={total}
              onChange={(ev, on)=>{
                if (ev !== currentPage){
                  setCurrentPage(ev);
                };
                if (on !== onPage){
                  setOnPage(on);
                };
                get_org_data_action(orgId, ev, on);
              }}
            />
            <Tag  color="#cdd2d6ff" style={{color:'#5a5a5aff'}}>
              Всего {dataList.length}
            </Tag>
          </div>
          <div>
            {/* Здесь будут фильтры */}
            <NavLink to={'/bids?type=2&&orgname=' + orgName}>
            <Button size={'small'} >
              Открыть в полном списке
            </Button></NavLink>
          </div>
        </div>

          <Spin spinning={showLoader} delay={500}>
        <div>
            <div className={'sa-org-bid-row sa-org-bid-row-header'}>
              <div>
                  <div>
                    id
                  </div>
              </div>
              <div>
                  <div>
                    Дата
                  </div>
              </div>

              <div>
                  <div>
                    Контактное лицо
                  </div>
              </div>
              <div>
                  <div>
                  Менеджер
                  </div>
              </div>
              <div>
                  <div>
                  Статус оплаты
                  </div>
              </div>
              <div>
                  <div>
                  Статус
                  </div>
              </div>
              <div>
                  <div>
                  Комментарий
                  </div>
              </div>
              <div>
                  <div>
                  Проект
                  </div>
              </div>
              <div>
                  <div>
                    Кол-во моделей
                  </div>
              </div>
          </div>
          {dataList.map((item)=>(
            <OrgBillModalRow
              org_id={orgId}
              data={item}
            />
          ))}
        </div>
        </Spin>
    </div>
    </Spin>
  );
};

export default OrgListModalBillsTab;