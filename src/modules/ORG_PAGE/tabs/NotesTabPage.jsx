import React, { useEffect, useState } from 'react';
import { ANTD_PAGINATION_LOCALE } from '../../../config/Localization';
import { Button, Collapse, Pagination, Spin } from 'antd';
import OrgNoteModalRow from '../../ORG_LIST/components/OrgModal/Tabs/TabComponents/RowTemplates/OrgNoteModalRow';
import dayjs from 'dayjs';
import { getMonthName } from '../../../components/helpers/TextHelpers';
import { PlusCircleFilled, PlusOutlined } from '@ant-design/icons';


const NotesTabPage = (props) => {
    const [orgId, setOrgId] = useState(null);
    const [show, setShow] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [onPage, setOnPage] = useState(30);
    const [loading, setLoading] = useState(false);
    const [editModa, setEditMode] = useState(false);

    // Структурированные в коллапсы юниты
    const [structureItems, setStructureItems] = useState([]);
    const [originalData, setOriginalData] = useState([]);

    // Новые юниты
    const [temporaryUnits, setTemporaryUnits] = useState([]);



  
    useEffect(() => {
      setShow(props.show);
    }, [props.show]);

    useEffect(() => {
      setCurrentPage(props.current_page);
    }, [props.current_page]);

    useEffect(() => {
        if (props.item_id){
          setOrgId(props.item_id);
        }
    }, [props.item_id]);


    useEffect(() => {
      if (props.current_page && props.current_page !== currentPage)
        setCurrentPage(props.current_page);
    }, [props.current_page]);


      useEffect(() => {
      if (props.base_data?.notes !== null && props.base_data?.notes?.length > 0){
        // setDataList(baseOrgData.projects);
          setOriginalData(props.base_data?.notes);
          setStructureItems(props.base_data?.notes.map((item)=>{
            
            return {
                key: 'norprow_' + item.id,
                label: <div className='sa-flex'><div>{item.theme}<span className='sa-date-text'>{item?.date ? " - " + getMonthName(dayjs(item.date).month()) + " " + dayjs(item.date).format("YYYY"): ""}</span> <span className={'sa-text-phantom'}>({item.id})</span></div></div>,
                children: <OrgNoteModalRow
                  data={item}
                  on_delete={handleDeleteRealUnit}
                  on_change={handleUpdateRealUnit}
                  // selects_data={props.selects_data}
                />
            }
          })
        )
      } else {
        setStructureItems([]);
      }
      setLoading(false);
    }, [props.base_data]);


    const get_org_data_action = (org_id, ev, on) => {
      if (props.on_change_page && ev !== currentPage){
        props.on_change_page(ev);
      };
    }


    const handleAddUnitBlank = () => {
      let spawn = {
        command: 'create',
        id: null,
        name: "name"
      };
    }

    const handleDeleteBlankUnit = (id) => {
      setTemporaryUnits(temporaryUnits.filter((item) => item !== id));
    }

    const handleDeleteRealUnit = (id) => {
      // const updata = {command: 'delete', id: id, deleted: 1};
      const uitem = originalData.find((item)=> item.id === id);
      if (uitem){
        uitem.deleted = 1;
        uitem.command = 'delete';
        let udata = originalData.filter(temporaryUnits.filter((item) => item !== id));
        udata.push(uitem);
        setOriginalData(udata);
      };
    }

    const handleUpdateBlankUnit = (id, data) => {
      let udata = temporaryUnits.filter(temporaryUnits.filter((item) => item !== id));
      udata.push(data);
      setTemporaryUnits(udata);
    }

    const handleUpdateRealUnit = (id, data) => {
      let udata = originalData.filter(temporaryUnits.filter((item) => item !== id));
      udata.push(data);
      setOriginalData(udata);
    }


    // если в call_to_save не null, а timestamp, отправляем данные на обновление
    useEffect(() => {
      if (props.call_to_save !== null && props.on_save !== null){
        props.on_save(originalData, temporaryUnits);
      }
    }, [props.call_to_save]);



  return (
    <div>
      {show && (

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
                      <Button 
                        icon={<PlusOutlined />}
                        onClick={handleAddUnitBlank}
                      >
                        Cоздать заметку
                      </Button>
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
      )}
    </div>
  );
};

export default NotesTabPage;