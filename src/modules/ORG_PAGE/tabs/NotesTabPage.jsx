import React, { useEffect, useState } from 'react';
import { ANTD_PAGINATION_LOCALE } from '../../../config/Localization';
import { Button, Collapse, Pagination, Spin } from 'antd';
import OrgNoteModalRow from '../../ORG_LIST/components/OrgModal/Tabs/TabComponents/RowTemplates/OrgNoteModalRow';
import dayjs from 'dayjs';
import { getMonthName } from '../../../components/helpers/TextHelpers';
import { PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import OrgNoteEditorSectionBox from '../components/sections/NotesTabSections/Rows/OrgNoteEditorSectionBox';


const NotesTabPage = (props) => {
    const {userdata} = props;

    const [orgId, setOrgId] = useState(null);
    const [show, setShow] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [onPage, setOnPage] = useState(30);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    const [newLoading, setNewLoading] = useState(false);

    // Структурированные в коллапсы юниты
    const [structureItems, setStructureItems] = useState([]);
    const [originalData, setOriginalData] = useState([]);

    // Новые юниты
    const [temporaryUnits, setTemporaryUnits] = useState([]);
    const [newStructureItems, setNewStructureItems] = useState([]);

    const [editedItemsIds, setEditedItemsIds] = useState([]);
    const [openedNewSections, setOpenedNewSections] = useState([]);
  
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
      
      if (props.edit_mode === false){
        if (editedItemsIds.length > 0 || newStructureItems.length > 0){
          if (window.confirm("У вас есть несохраненные заметки! Отменить изменения?")){
            setEditMode(props.edit_mode);
            setTemporaryUnits([]);
            setStructureItems(originalData);
          } else {
            alert('Нажмите кнопку [Редактировать] и заново сохраните данные');
          }
        }
      } else {
        setEditMode(props.edit_mode);
      }
    }, [props.edit_mode]);





      useEffect(() => {
      if (props.base_data?.notes !== null && props.base_data?.notes?.length > 0){
        let secids = [];
        // setDataList(baseOrgData.projects);
        let strdata = props.base_data?.notes.map((item)=>{
            secids.push('norprow_' + item.id);
            return {
                key: 'norprow_' + item.id,
                label: <div className='sa-flex-space'>
                  <div>{item.theme}
                    <span className='sa-date-text'>{item?.date ? " - " + getMonthName(dayjs(item.date).month() + 1) + " " + dayjs(item.date).format("YYYY"): ""}</span>  <span className={'sa-text-phantom'}>({item.id})</span></div>
                    <Button size='small' 
                      onClick={(ev)=>{
                        ev.stopPropagation();
                        console.log(item.id);
                        handleDeleteRealUnit(item.id);
                      }}
                    >Удалить</Button>
                    </div>,
                children: <OrgNoteEditorSectionBox
                  data={item}
                  on_delete={handleDeleteRealUnit}
                  on_change={handleUpdateRealUnit}
                  edit_mode={editMode}
                  // selects_data={props.selects_data}
                />
            }
          });

          setOriginalData(strdata);
          setStructureItems(strdata);
      } else {
        setStructureItems([]);
      }
      setLoading(false);
    }, [props.base_data, editMode]);






    useEffect(() => {
      let secids = [];
      setNewStructureItems(temporaryUnits.map((item)=>{
        let nkey = 'new_norprow_' + item.id;
        secids.push(nkey);
            return {
                key: nkey,
                label: <div className='sa-flex-space'>
                  <div>{item.theme}
                    <span className='sa-date-text'>{item?.date ? " - " + getMonthName(dayjs(item.date).month() + 1) + " " + dayjs(item.date).format("YYYY"): ""}</span>  <span className={'sa-text-phantom'}>({item.id})</span></div>
                    <Button size='small' 
                      onClick={(ev)=>{
                        ev.stopPropagation();
                        console.log(item.id);
                        handleDeleteBlankUnit(item.id);
                      }}
                    >Удалить</Button>
                    </div>,
                children: <OrgNoteEditorSectionBox
                  data={item}
                  on_delete={handleDeleteBlankUnit}
                  on_change={handleUpdateBlankUnit}
                  edit_mode={editMode}
                  // selects_data={props.selects_data}
                />
            }
          })
        );
        // secids.reverse();
        console.log(secids);
        setOpenedNewSections(secids);
        setNewLoading(false);
    }, [temporaryUnits, editMode]);





    const get_org_data_action = (org_id, ev, on) => {
      if (props.on_change_page && ev !== currentPage){
        props.on_change_page(ev);
      };
    }


    const handleAddUnitBlank = () => {
      setNewLoading(true);
      console.log('ADDED NEW DDDDDDDDDD')
      setTimeout(() => {
        let spawn = {
              "command": "create",
              "id": 'new_' + dayjs().unix() + dayjs().millisecond() + temporaryUnits.length,
              "id_orgs": props.item_id,
              "id8staff_list": userdata.user.id,
              "theme": "Обзвон 2016",
              "date": dayjs().format('YYYY-MM-DD HH:mm:ss'), //"2016-09-04T21:00:00.000000Z",
              "notes": "До компании дозвониться не удалось. В ФНС данных о ликвидации нет. Сайт работает. Инф. письмо выслано на zszniiep@zniiep.com для Тихомирова Александра Васильевича [Генеральный Директор].",
              "deleted": 0,
              "creator": {
                  "id": userdata.user.id,
                  "surname": userdata?.user.surname,
                  "name": userdata?.user.name,
                  "secondname": userdata?.user.secondname,
              }
            };
  
            setTemporaryUnits(prevItems => [spawn, ...prevItems]);
            console.log(spawn);
        
      }, 760);
    }


    const handleDeleteBlankUnit = (id) => {
      setTemporaryUnits(temporaryUnits.filter((item) => item.id !== id));
    }


    const handleDeleteRealUnit = (id) => {
      // const updata = {command: 'delete', id: id, deleted: 1};
      const uitem = originalData.find((item)=> item.id === id);
      if (uitem){
        uitem.deleted = 1;
        uitem.command = 'delete';
        let udata = originalData.filter((item) => item.id !== id);
        udata.push(uitem);
        setOriginalData(udata);
      };
    }


    const handleUpdateBlankUnit = (id, data) => {
      console.log('id, data', id, data, temporaryUnits);
      let udata = temporaryUnits.filter((item) => item.id !== id);
      console.log('udata', udata)
      udata.push(data);
      setTemporaryUnits(udata);
    }
    

    const handleUpdateRealUnit = (id, data) => {
      let udata = originalData.filter((item) => item.id !== id);
      udata.push(data);
      setOriginalData(udata);
    }


    // если в call_to_save не null, а timestamp, отправляем данные на обновление
    useEffect(() => {
      console.log('originalData', originalData, temporaryUnits);
      if (props.call_to_save !== null && props.on_save !== null){
        props.on_save(originalData, temporaryUnits);
      }
    }, [props.call_to_save]);



  return (
    <div>
      {show && (

         <Spin spinning={loading}>
            <div className={'sa-orgtab-container'}>
                <div className={'sa-pa-6 sa-flex-space'} style={{paddingTop: '9px'}}>
                  <div>
                    <Pagination
                      disabled={editMode}
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
                      {editMode && (
                        <Button type={'primary'} 
                          icon={<PlusOutlined/>} 
                          onClick={handleAddUnitBlank}
                          disabled={newStructureItems.length > 7 || newLoading}
                        >
                          Cоздать заметку
                        </Button>
                      )}
                    </div>
                </div>
                <div>
                {newStructureItems.length > 0 && (
                  <div className={'sa-org-temp-stack-collapse'}>
                    <div className={'sa-org-temp-stack-collapse-header'}>Новые заметки</div>
                    <Spin spinning={newLoading} delay={500}>
                    <Collapse 
                    size={'small'}
                    items={newStructureItems}
                      activeKey={openedNewSections}
                    /></Spin>
                   </div>

                )}

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