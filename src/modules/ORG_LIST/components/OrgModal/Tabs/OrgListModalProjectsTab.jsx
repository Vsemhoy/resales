import { Collapse, Pagination, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import OrgBidTabRow from './TabComponents/OrgBidTabRow';
import { CSRF_TOKEN, PRODMODE } from '../../../../../config/config';
import { OM_ORG_BIDS } from '../../mock/ORGLISTMOCK';
import { NavLink } from 'react-router-dom';
import { PROD_AXIOS_INSTANCE } from '../../../../../config/Api';
import OrgProjectsModalRow from './TabComponents/RowTemplates/OrgProjectsModalRow';
import { ANTD_PAGINATION_LOCALE } from '../../../../../config/Localization';
import { MODAL_PROJECTS_LIST } from '../../mock/MODALPROJECTSTABMOCK';
import dayjs from 'dayjs';
import { getMonthName } from '../../../../../components/helpers/TextHelpers';

const OrgListModalProjectsTab = (props) => {
  const [baseBids, setBaseBids] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [onPage, setOnPage] = useState(30);

  const [orgId, setOrgId] = useState(null);
  const [baseOrgData, setBaseOrgData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [total, setTotal] = useState(1);
  const [structureItems, setStructureItems] = useState([]);



  useEffect(() => {
    if (props.data?.id){
      if (PRODMODE){
        setCurrentPage(1);
        if (props.data?.id !== orgId){
          setLoading(true);
          setOrgId(props.data.id);
          get_org_data_action(props.data.id, 1, onPage);
        }
      } else {
        setOrgId(props.data.id);
        setBaseOrgData(MODAL_PROJECTS_LIST);
      }

    } else {
      setOrgId(null);
      setBaseOrgData(null);
    }
  }, [props.data]);



    useEffect(() => {
      if (baseOrgData?.projects !== null && baseOrgData?.projects?.length > 0){
        // setDataList(baseOrgData.projects);
          setStructureItems(baseOrgData?.projects.map((item)=>{
            
            return {
                key: 'orprow_' + item.id,
                label: <div className='sa-flex'><div>{item.name}<span className='sa-date-text'>{item?.date ? " - " + getMonthName(dayjs(item.date).month()) + " " + dayjs(item.date).format("YYYY"): ""}</span> <span className={'sa-text-phantom'}>({item.id})</span></div></div>,
                children: <OrgProjectsModalRow
                  data={item}
                  // selects_data={props.selects_data}
                />
            }
          })
        )
      } else {
        setStructureItems([]);
      }
      setLoading(false);
    }, [baseOrgData]);


  /** ----------------------- FETCHES -------------------- */

  const get_org_data_action = async (id, cpage, onpage) => {

  
      try {
          let response = await PROD_AXIOS_INSTANCE.post('/api/sales/v2/orglist/' + id + '/p', {
             data: {
              page: cpage,
              limit: onpage,
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

export default OrgListModalProjectsTab;