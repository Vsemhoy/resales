import React, { useEffect, useState } from 'react';
import { CSRF_TOKEN, PRODMODE } from '../../../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../../../config/Api';
import { Collapse, Pagination, Spin } from 'antd';
import { MODAL_NOTES_LIST } from '../../mock/MODALNOTESTABMOCK';
import OrgNoteModalRow from './TabComponents/RowTemplates/OrgNoteModalRow';
import { ANTD_PAGINATION_LOCALE } from '../../../../../config/Localization';
import { PencilIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import { getMonthName } from '../../../../../components/helpers/TextHelpers';


const OrgListModalNotesTab = (props) => {
  const [baseBids, setBaseBids] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [onPage, setOnPage] = useState(30);
  const [showLoader, setShowLoader] = useState(false);

  const [orgId, setOrgId] = useState(null);
  const [baseOrgData, setBaseOrgData] = useState(null);
  const [loading, setLoading] = useState(false);


  const [total, setTotal] = useState(1);
  const [structureItems, setStructureItems] = useState([]);

  useEffect(() => {
    if (props.data?.id){
      if (props.data?.id !== orgId){
      if (PRODMODE){
          setCurrentPage(1);
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
        if (baseOrgData?.name && props.on_load){
          props.on_load(baseOrgData.name);
        }
      if (baseOrgData?.notes !== null && baseOrgData?.notes?.length > 0){
        // setDataList(baseOrgData.projects);
          setStructureItems(baseOrgData?.notes.map((item)=>{
            
            return {
                key: 'orprow_' + item.id,
                label: <div className='sa-flex'><div>{item.theme}<span className='sa-date-text'>{item?.date ? " - " + getMonthName(dayjs(item.date).month()) + " " + dayjs(item.date).format("YYYY"): ""}</span> <span className={'sa-text-phantom'}>({item.id})</span></div></div>,
                children: <OrgNoteModalRow
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
          setStructureItems([]);
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
              
            </div>
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

export default OrgListModalNotesTab;