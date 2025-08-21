import { Pagination, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import OrgBidTabRow from './TabComponents/OrgBidTabRow';
import { CSRF_TOKEN, PRODMODE } from '../../../../../config/config';
import { OM_ORG_BIDS } from '../../mock/ORGLISTMOCK';
import { NavLink } from 'react-router-dom';
import { PROD_AXIOS_INSTANCE } from '../../../../../config/Api';


const OrgListModalProjectsTab = (props) => {
  const [baseBids, setBaseBids] = useState([]);
  const [currrentPage, setCurrrentPage] = useState(1);
  const [onPage, setOnPage] = useState(30);

  const [orgId, setOrgId] = useState(null);
  const [baseOrgData, setBaseOrgData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.data?.id){
      setLoading(true);
      setOrgId(props.data.id);
      get_org_data_action(props.data.id);

    } else {
      setOrgId(null);
      setBaseOrgData(null);
    }
  }, [props.data]);


  /** ----------------------- FETCHES -------------------- */

  const get_org_data_action = async (id) => {

  
      try {
          let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/p', {
            data: {},
            _token: CSRF_TOKEN
          });
          console.log('response', response);
          if (response.data){
              // if (props.changed_user_data){
              //     props.changed_user_data(response.data);
              // }
              setBaseOrgData(response.data.content);
              setLoading(false);
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
        <div className={'sa-pa-6'}>
          <Pagination size={'small'}

          />
        </div>
        <div>
            <div className={'sa-org-bid-row sa-org-bid-row-header'}>
              <div>
                  <div>
                    Дата
                  </div>
              </div>
              <div>
                  <div>
                    
                    Номер
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
                  Статус
                  </div>
              </div>
              <div>
                  <div>
                  Комментарий
                  </div>
              </div>
          </div>
          {baseBids.map((bid)=>(
            <OrgBidTabRow 
              data={bid}
            />
          ))}
        </div>
    </div>
    </Spin>
  );
};

export default OrgListModalProjectsTab;