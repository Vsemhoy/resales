import React, { useEffect, useState } from 'react';
import { CSRF_TOKEN } from '../../../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../../../config/Api';
import { Spin } from 'antd';


const OrgListModalNotesTab = (props) => {
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
          let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/n', {
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
    <div>
      <Spin spinning={loading}>
        OrgListNotesTab
        </Spin>
    </div>
  );
};

export default OrgListModalNotesTab;