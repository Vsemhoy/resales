import React, { useEffect, useState } from 'react';
import { PROD_AXIOS_INSTANCE } from '../../../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../../../config/config';
import { Collapse, Pagination, Spin } from 'antd';
import { MODAL_CALLS_LIST } from '../../mock/MODALCALLSTABMOCK';
import OrgCallsModalRow from './TabComponents/RowTemplates/OrgCallsModalRow';
import { ANTD_PAGINATION_LOCALE } from '../../../../../config/Localization';


const OrgListModalCallMeetingsTab = (props) => {
  const [baseBids, setBaseBids] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [onPage, setOnPage] = useState(30);
  const [showLoader, setShowLoader] = useState(false);
  const [total, setTotal] = useState(1);

  const [orgId, setOrgId] = useState(null);
  const [baseOrgData, setBaseOrgData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [structureItems, setStructureItems] = useState([]);

  useEffect(() => {
    if (props.data?.id){
      if (PRODMODE){
        setCurrentPage(1);
        if (props.data?.id !== orgId){
            setLoading(true);
            setOrgId(props.data.id);
            get_org_data_action(props.data.id);
          }
      } else {
        setOrgId(props.data.id);
        setBaseOrgData(MODAL_CALLS_LIST);
      }

    } else {
      setOrgId(null);
      setBaseOrgData(null);
    }
  }, [props.data]);




    useEffect(() => {
      let result = [];

      if (baseOrgData?.calls !== null && baseOrgData?.calls?.length > 0){
        result = baseOrgData.calls;
      };
      if (baseOrgData?.meetings !== null && baseOrgData?.meetings?.length > 0){
        result = result.concat(baseOrgData.meetings);
      };
      // setDataList(result);
      setLoading(false);
      setStructureItems(result.map((item)=>{
            
            return {
                key: 'orprow_' + item.id,
                label: 'Общая информация' + item.id,
                children: <OrgCallsModalRow
                  data={item}
                  // selects_data={props.selects_data}
                />
            }
          })
        )
        console.log(baseOrgData?.meetings);
    }, [baseOrgData]);


  /** ----------------------- FETCHES -------------------- */

  const get_org_data_action = async (id) => {

  
      try {
          let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/c', {
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
    <Spin spinning={loading}>
    <div className={'sa-orgtab-container'}>
        <div className={'sa-pa-6'}>
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
        <Collapse
            // defaultActiveKey={['st_commoninfo', 'st_departinfo', 'st_contactinfo']}
            // activeKey={modalSectionsOpened}
            size={'small'}
            // onChange={handleSectionChange}
            // onMouseDown={handleSectionClick}
            items={structureItems} />
            

        </div>
    </div>
    </Spin>
  );
};

export default OrgListModalCallMeetingsTab;