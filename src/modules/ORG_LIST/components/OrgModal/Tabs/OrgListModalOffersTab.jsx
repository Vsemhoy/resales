import { Button, Pagination, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { PROD_AXIOS_INSTANCE } from '../../../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../../../config/config';
import { MODAL_OFFERS_LIST } from '../../mock/MODALOFFERSTABMOCK';
import OrgOfferModalRow from './TabComponents/RowTemplates/OrgOfferModalRow';
import { ANTD_PAGINATION_LOCALE } from '../../../../../config/Localization';
import { NavLink } from 'react-router-dom';


const OrgListModalOffersTab = (props) => {
  const [baseBids, setBaseBids] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [onPage, setOnPage] = useState(30);
  const [showLoader, setShowLoader] = useState(false);
  const [total, setTotal] = useState(1);

  const [orgId, setOrgId] = useState(null);
  const [orgName, setOrgName] = useState(null);
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
        setBaseOrgData(MODAL_OFFERS_LIST);
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
              type: 1
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
          <div>
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
          </div>
          <div>
            {/* Здесь будут фильтры */}
            <NavLink to={'/bids?type=1&orgname=' + orgName}>
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
            <OrgOfferModalRow
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

export default OrgListModalOffersTab;