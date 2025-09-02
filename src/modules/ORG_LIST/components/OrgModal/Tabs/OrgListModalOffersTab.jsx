import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { PROD_AXIOS_INSTANCE } from '../../../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../../../config/config';
import { MODAL_OFFERS_LIST } from '../../mock/MODALOFFERSTABMOCK';


const OrgListModalOffersTab = (props) => {
  const [baseBids, setBaseBids] = useState([]);
  const [currrentPage, setCurrrentPage] = useState(1);
  const [onPage, setOnPage] = useState(30);
  const [showLoader, setShowLoader] = useState(false);
  const [total, setTotal] = useState(1);

  const [orgId, setOrgId] = useState(null);
  const [baseOrgData, setBaseOrgData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.data?.id){
      if (PRODMODE){
        setLoading(true);
        setOrgId(props.data.id);
        get_org_data_action(props.data.id);

      } else {
        setBaseOrgData(MODAL_OFFERS_LIST);
      }

    } else {
      setOrgId(null);
      setBaseOrgData(null);
    }
  }, [props.data]);


  /** ----------------------- FETCHES -------------------- */

  const get_org_data_action = async (id) => {

  
      try {
          let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/b', {
            data: {
              page: currrentPage,
              limit: onPage,
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
    <div>
      <Spin spinning={loading}>
        OrgListOffersTab</Spin>
    </div>
  );
};

export default OrgListModalOffersTab;