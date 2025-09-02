import React, { useEffect, useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../../../config/Api';
import { Spin } from 'antd';
import { MODAL_NOTES_LIST } from '../../mock/MODALNOTESTABMOCK';
import OrgNoteModalRow from './TabComponents/RowTemplates/OrgNoteModalRow';


const OrgListModalNotesTab = (props) => {
  const [baseBids, setBaseBids] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [onPage, setOnPage] = useState(30);
  const [showLoader, setShowLoader] = useState(false);
  const [total, setTotal] = useState(1);

  const [orgId, setOrgId] = useState(null);
  const [baseOrgData, setBaseOrgData] = useState(null);
  const [loading, setLoading] = useState(false);

    const [dataList, setDataList] = useState([]);

  useEffect(() => {
    if (props.data?.id){
      if (props.data?.id !== orgId){
      if (PRODMODE){
          setLoading(true);
          setOrgId(props.data.id);
          get_org_data_action(props.data.id);
        } else {
          setBaseOrgData(MODAL_NOTES_LIST);
        }
      }


    } else {
      setOrgId(null);
      setBaseOrgData(null);
    }
  }, [props.data]);



  useEffect(() => {
    
    console.log('BORGD', dataList);
    if (baseOrgData && baseOrgData?.notes !== null && baseOrgData.notes?.length > 0){
      setDataList(baseOrgData.notes);
    } else {
      setDataList([]);
    }
    setLoading(false);
  }, [baseOrgData]);


  /** ----------------------- FETCHES -------------------- */

  const get_org_data_action = async (id) => {

  
      try {
          let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/n', {
            data: {
              page: currentPage,
              limit: onPage,
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
        
        {dataList && dataList.map((item)=> (
          <OrgNoteModalRow
           data={item}

           />
        ))}

        </Spin>
    </div>
  );
};

export default OrgListModalNotesTab;